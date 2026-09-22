import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import {
  calculateDueDate,
  calculateFine,
  calculateLostDamagedFee,
  formatDbDate
} from '../utils/fineCalculator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jntua_clms_super_secret_jwt_key_2024_anantapur';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
  return jwt.sign(
    { id: user.id, member_id: user.member_id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Issue a book to a user
 * Supports:
 * 1. Form submission with student details: name, email (Gmail), admissionNumber (member_id), phone, issueDate
 * 2. Authenticated user issuing book for self or admin issuing on behalf of student
 * 3. Persists/updates all student details in the backend database
 */
export async function issueBook(req, res) {
  try {
    const {
      bookId,
      targetUserId,
      name,
      email,
      admissionNumber,
      phone,
      mobileNumber,
      issueDate: rawIssueDate
    } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required to issue a book.'
      });
    }

    const studentMobile = (phone || mobileNumber || '').trim();
    const studentAdmission = (admissionNumber || '').trim();
    const studentEmail = (email || '').trim().toLowerCase();
    const studentName = (name || '').trim();

    // Determine borrower user ID and ensure student record is created/updated in backend
    let borrower = null;

    if (studentEmail || studentAdmission) {
      // Find by email or admission number
      let existingUser = await db.get(
        'SELECT * FROM users WHERE (LOWER(email) = ? OR LOWER(member_id) = ?) AND status = ?',
        [studentEmail || '', studentAdmission.toLowerCase(), 'active']
      );

      if (existingUser) {
        // Update user's latest info in database
        const updatedName = studentName || existingUser.name;
        const updatedPhone = studentMobile || existingUser.phone;
        const updatedMemberId = studentAdmission ? studentAdmission.toUpperCase() : existingUser.member_id;
        const updatedEmail = studentEmail || existingUser.email;

        await db.run(
          `UPDATE users SET name = ?, phone = ?, member_id = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [updatedName, updatedPhone, updatedMemberId, updatedEmail, existingUser.id]
        );

        borrower = await db.get('SELECT * FROM users WHERE id = ?', [existingUser.id]);
      } else {
        // Register new student user in database
        const finalMemberId = studentAdmission ? studentAdmission.toUpperCase() : ('21001A' + Math.floor(1000 + Math.random() * 9000));
        const finalName = studentName || 'Student';
        const finalEmail = studentEmail || `${finalMemberId.toLowerCase()}@gmail.com`;
        const passwordHash = await bcrypt.hash('jntua@123', 10);

        const insertUser = await db.run(
          `INSERT INTO users (member_id, name, email, password_hash, role, department, phone, max_books_allowed, status)
           VALUES (?, ?, ?, ?, 'student', 'Computer Science & Engineering', ?, 3, 'active')`,
          [finalMemberId, finalName, finalEmail, passwordHash, studentMobile]
        );

        borrower = await db.get('SELECT * FROM users WHERE id = ?', [insertUser.lastInsertRowid]);
        console.log(`Registered new student borrower: ${finalName} (${finalMemberId}, ${finalEmail}, ${studentMobile})`);
      }
    } else if (req.user) {
      const borrowerId = (req.user.role === 'admin' && targetUserId) ? targetUserId : req.user.id;
      borrower = await db.get('SELECT * FROM users WHERE id = ? AND status = ?', [borrowerId, 'active']);
    }

    if (!borrower) {
      return res.status(400).json({
        success: false,
        message: 'Student details (Name, Gmail, Admission Number, Mobile Number) are required to borrow.'
      });
    }

    const borrowerId = borrower.id;

    // Execute issue transaction atomically
    const transactionResult = await db.transaction(async (tx) => {
      // 1. Quota check
      const activeIssues = await tx.get(
        "SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = 'issued'",
        [borrowerId]
      );
      if (activeIssues.count >= borrower.max_books_allowed) {
        throw new Error(
          `Borrowing limit exceeded. Maximum quota is ${borrower.max_books_allowed} books. Please return an existing book first.`
        );
      }

      // 2. Check if user already holds this book
      const existingHold = await tx.get(
        "SELECT id FROM transactions WHERE user_id = ? AND book_id = ? AND status = 'issued'",
        [borrowerId, bookId]
      );
      if (existingHold) {
        throw new Error('You already have an active issued copy of this book.');
      }

      // 3. Check book availability
      const book = await tx.get('SELECT * FROM books WHERE id = ? AND status = ?', [bookId, 'active']);
      if (!book) {
        throw new Error('Book is not available in catalog.');
      }

      if (book.available_copies <= 0) {
        throw new Error('No physical copies currently available. You may reserve this book to join the waitlist.');
      }

      // 4. Calculate exact issue and 15-day due date
      const issueDateObj = rawIssueDate ? new Date(rawIssueDate) : new Date();
      // Set to current time if only date was provided
      if (isNaN(issueDateObj.getTime())) {
        throw new Error('Invalid issue date format.');
      }
      const dueDateObj = calculateDueDate(issueDateObj);

      // 5. Decrement available copies
      await tx.run(
        'UPDATE books SET available_copies = available_copies - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bookId]
      );

      // 6. Create transaction record with student contact details in notes
      const notes = `Issued to: ${borrower.name} | Roll No: ${borrower.member_id} | Gmail: ${borrower.email} | Mobile: ${borrower.phone || 'N/A'}`;
      const insertResult = await tx.run(
        `INSERT INTO transactions 
          (user_id, book_id, issue_date, due_date, status, calculated_fine, lost_damaged_charge, total_paid, notes)
         VALUES (?, ?, ?, ?, 'issued', 0.0, 0.0, 0.0, ?)`,
        [
          borrowerId,
          bookId,
          formatDbDate(issueDateObj),
          formatDbDate(dueDateObj),
          notes
        ]
      );

      // 7. Fulfill any active reservations for this student
      await tx.run(
        "UPDATE reservations SET status = 'fulfilled', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'ready_for_pickup')",
        [borrowerId, bookId]
      );

      return {
        transactionId: insertResult.lastInsertRowid,
        bookTitle: book.title,
        borrowerName: borrower.name,
        borrowerMemberId: borrower.member_id,
        borrowerEmail: borrower.email,
        borrowerPhone: borrower.phone,
        issueDate: formatDbDate(issueDateObj),
        dueDate: formatDbDate(dueDateObj)
      };
    });

    const token = signToken(borrower);
    const { password_hash, ...safeUser } = borrower;

    res.status(201).json({
      success: true,
      message: `Book "${transactionResult.bookTitle}" borrowed successfully by ${borrower.name} (${borrower.member_id}). Due date: ${transactionResult.dueDate.split(' ')[0]} (15 days period).`,
      token,
      user: safeUser,
      details: transactionResult
    });
  } catch (err) {
    console.error('issueBook error:', err);
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
      const feeBreakdown = calculateLostDamagedFee(txn.due_date, reportDate);

      await tx.run(
        `UPDATE books SET 
          total_copies = MAX(0, total_copies - 1),
          updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [txn.book_id]
      );

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
 * Get current user's transactions
 */
export async function getUserTransactions(req, res) {
  try {
    const userId = req.user.id;

    const active = await db.query(
      `SELECT t.*, b.title, b.author, b.isbn, b.shelf_location, b.cover_image, c.name as category_name
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE t.user_id = ? AND t.status = 'issued'
       ORDER BY t.due_date ASC`,
      [userId]
    );

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
