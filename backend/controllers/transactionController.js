import db from '../config/db.js';
import {
  calculateDueDate,
  calculateFine,
  calculateLostDamagedFee,
  formatDbDate
} from '../utils/fineCalculator.js';

/**
 * Issue a book to a user (Atomically decrements copies, sets 15-day due date)
 */
export async function issueBook(req, res) {
  try {
    const { bookId, targetUserId } = req.body;
    // An admin can issue on behalf of a student/faculty, or a logged-in user issues for self
    const borrowerId = (req.user.role === 'admin' && targetUserId) ? targetUserId : req.user.id;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required to issue a book.'
      });
    }

    // Execute atomically inside database transaction
    const transactionResult = await db.transaction(async (tx) => {
      // 1. Fetch borrower details and check borrowing quota
      const borrower = await tx.get('SELECT * FROM users WHERE id = ? AND status = ?', [borrowerId, 'active']);
      if (!borrower) {
        throw new Error('Borrower user not found or account is not active.');
      }

      const activeIssues = await tx.get(
        "SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = 'issued'",
        [borrowerId]
      );
      if (activeIssues.count >= borrower.max_books_allowed) {
        throw new Error(
          `Borrowing limit exceeded. ${borrower.role === 'faculty' ? 'Faculty' : 'Student'} quota is ${borrower.max_books_allowed} books. Please return an existing book first.`
        );
      }

      // 2. Check if user already holds a copy of this book
      const existingHold = await tx.get(
        "SELECT id FROM transactions WHERE user_id = ? AND book_id = ? AND status = 'issued'",
        [borrowerId, bookId]
      );
      if (existingHold) {
        throw new Error('User already has an active issued copy of this book.');
      }

      // 3. Check book availability
      const book = await tx.get('SELECT * FROM books WHERE id = ? AND status = ?', [bookId, 'active']);
      if (!book) {
        throw new Error('Book is not available in catalog.');
      }

      if (book.available_copies <= 0) {
        throw new Error('No physical copies currently available. You may reserve this book to join the waitlist.');
      }

      // 4. Calculate exact 15-day due date
      const issueDate = new Date();
      const dueDate = calculateDueDate(issueDate);

      // 5. Decrement available copies
      await tx.run(
        'UPDATE books SET available_copies = available_copies - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bookId]
      );

      // 6. Create transaction record
      const insertResult = await tx.run(
        `INSERT INTO transactions 
          (user_id, book_id, issue_date, due_date, status, calculated_fine, lost_damaged_charge, total_paid, notes)
         VALUES (?, ?, ?, ?, 'issued', 0.0, 0.0, 0.0, ?)`,
        [
          borrowerId,
          bookId,
          formatDbDate(issueDate),
          formatDbDate(dueDate),
          `Issued at JNTUA Central Library counter. Valid for 15 days.`
        ]
      );

      // 7. If borrower had an active reservation for this book, mark it fulfilled
      await tx.run(
        "UPDATE reservations SET status = 'fulfilled', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'ready_for_pickup')",
        [borrowerId, bookId]
      );

      return {
        transactionId: insertResult.lastInsertRowid,
        bookTitle: book.title,
        borrowerName: borrower.name,
        issueDate: formatDbDate(issueDate),
        dueDate: formatDbDate(dueDate)
      };
    });

    res.status(201).json({
      success: true,
      message: `Book "${transactionResult.bookTitle}" issued successfully. Due date is ${transactionResult.dueDate.split(' ')[0]} (15 days period).`,
      details: transactionResult
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to issue book.'
    });
  }
}

/**
 * Return a book (Calculates overdue days, dynamic ₹1/day late fine, updates inventory & triggers reservations)
 */
export async function returnBook(req, res) {
  try {
    const { transactionId } = req.body;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required to process return.'
      });
    }

    const returnResult = await db.transaction(async (tx) => {
      // 1. Fetch transaction
      const txn = await tx.get(
        `SELECT t.*, b.title as book_title, b.id as book_id, u.name as user_name
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         JOIN users u ON t.user_id = u.id
         WHERE t.id = ? AND t.status = 'issued'`,
        [transactionId]
      );

      if (!txn) {
        throw new Error('Active issued transaction not found or book has already been returned/closed.');
      }

      // Verify user owns transaction or is admin
      if (!isAdmin && txn.user_id !== currentUserId) {
        throw new Error('Unauthorized to return this book.');
      }

      const returnDate = new Date();
      // 2. Authoritative backend fine calculation: ₹1/day overdue
      const { overdueDays, fineAmount, isOverdue } = calculateFine(txn.due_date, returnDate);

      // 3. Atomically increment available copies in inventory
      await tx.run(
        'UPDATE books SET available_copies = available_copies + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [txn.book_id]
      );

      // 4. Update transaction record
      await tx.run(
        `UPDATE transactions SET 
          return_date = ?, 
          status = 'returned', 
          calculated_fine = ?, 
          notes = ?, 
          updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          formatDbDate(returnDate),
          fineAmount,
          isOverdue 
            ? `Returned ${overdueDays} days late. Fine assessed: ₹${fineAmount}.` 
            : 'Returned on time. Zero fine.',
          transactionId
        ]
      );

      // 5. Check reservation queue for this book
      // If there are pending reservations, notify the first in queue!
      let notifiedUser = null;
      const nextReservation = await tx.get(
        `SELECT r.*, u.name as student_name, u.email as student_email 
         FROM reservations r
         JOIN users u ON r.user_id = u.id
         WHERE r.book_id = ? AND r.status = 'pending'
         ORDER BY r.queue_position ASC, r.id ASC
         LIMIT 1`,
        [txn.book_id]
      );

      if (nextReservation) {
        await tx.run(
          `UPDATE reservations SET 
            status = 'ready_for_pickup', 
            notified_at = CURRENT_TIMESTAMP, 
            updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [nextReservation.id]
        );
        notifiedUser = nextReservation.student_name;
      }

      return {
        transactionId,
        bookTitle: txn.book_title,
        userName: txn.user_name,
        returnDate: formatDbDate(returnDate),
        overdueDays,
        fineAmount,
        isOverdue,
        notifiedUser
      };
    });

    res.json({
      success: true,
      message: returnResult.isOverdue
        ? `Book returned successfully. Overdue: ${returnResult.overdueDays} day(s). Late fine payable: ₹${returnResult.fineAmount}.`
        : 'Book returned successfully on time. Fine: ₹0.',
      details: returnResult
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to process return.'
    });
  }
}

/**
 * Report a book as Lost or Damaged
 * Rule: ₹300 replacement/damage fee + applicable late fine. Available copy NOT restored.
 */
export async function reportLostOrDamaged(req, res) {
  try {
    const { transactionId, statusType, notes } = req.body;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!transactionId || !['lost', 'damaged'].includes(statusType)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and valid statusType ("lost" or "damaged") are required.'
      });
    }

    const reportResult = await db.transaction(async (tx) => {
      const txn = await tx.get(
        `SELECT t.*, b.title as book_title, b.id as book_id, u.name as user_name
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         JOIN users u ON t.user_id = u.id
         WHERE t.id = ? AND t.status = 'issued'`,
        [transactionId]
      );

      if (!txn) {
        throw new Error('Active transaction not found for this book.');
      }

      if (!isAdmin && txn.user_id !== currentUserId) {
        throw new Error('Unauthorized to report status for this transaction.');
      }

      const reportDate = new Date();
      // Calculate ₹300 fixed fee + late fine
      const feeBreakdown = calculateLostDamagedFee(txn.due_date, reportDate);

      // Decrement total copies (physical asset is destroyed/lost) and DO NOT increment available copies
      await tx.run(
        `UPDATE books SET 
          total_copies = MAX(0, total_copies - 1),
          updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [txn.book_id]
      );

      // Update transaction status to lost or damaged
      const auditNote = notes || `Reported ${statusType} on ${formatDbDate(reportDate)}. Penalty: ₹300 + Late Fine: ₹${feeBreakdown.lateFine} = Total: ₹${feeBreakdown.totalPayable}.`;

      await tx.run(
        `UPDATE transactions SET 
          return_date = ?, 
          status = ?, 
          calculated_fine = ?, 
          lost_damaged_charge = ?, 
          notes = ?, 
          updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          formatDbDate(reportDate),
          statusType,
          feeBreakdown.lateFine,
          feeBreakdown.lostDamagedCharge,
          auditNote,
          transactionId
        ]
      );

      return {
        transactionId,
        bookTitle: txn.book_title,
        status: statusType,
        ...feeBreakdown
      };
    });

    res.json({
      success: true,
      message: `Book reported as ${statusType}. Replacement penalty: ₹${reportResult.lostDamagedCharge} + Late fine: ₹${reportResult.lateFine}. Total payable: ₹${reportResult.totalPayable}.`,
      details: reportResult
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to record lost/damaged book.'
    });
  }
}

/**
 * Get current user's transactions (active loans with live fine calculation, and past history)
 */
export async function getUserTransactions(req, res) {
  try {
    const userId = req.user.id;

    // Active issued books
    const active = await db.query(
      `SELECT t.*, b.title, b.author, b.isbn, b.shelf_location, b.cover_image, c.name as category_name
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE t.user_id = ? AND t.status = 'issued'
       ORDER BY t.due_date ASC`,
      [userId]
    );

    // Calculate real-time countdown / overdue for active loans
    const activeWithLiveStats = active.map((item) => {
      const liveFine = calculateFine(item.due_date);
      return {
        ...item,
        live_overdue_days: liveFine.overdueDays,
        live_fine: liveFine.fineAmount,
        is_overdue: liveFine.isOverdue,
        days_remaining: liveFine.daysRemaining
      };
    });

    // History (returned, lost, damaged)
    const history = await db.query(
      `SELECT t.*, b.title, b.author, b.isbn, b.shelf_location, b.cover_image, c.name as category_name,
        u_admin.name as adjusted_by_admin_name
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN users u_admin ON t.adjusted_by = u_admin.id
       WHERE t.user_id = ? AND t.status != 'issued'
       ORDER BY t.return_date DESC, t.id DESC`,
      [userId]
    );

    res.json({
      success: true,
      active: activeWithLiveStats,
      history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
      error: err.message
    });
  }
}
