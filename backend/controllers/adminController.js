import db from '../config/db.js';
import { calculateFine, formatDbDate, calculateDueDate } from '../utils/fineCalculator.js';

/**
 * Admin Dashboard Statistics & KPIs
 */
export async function getDashboardStats(req, res) {
  try {
    // Books summary
    const bookStats = await db.get(
      'SELECT COUNT(*) as total_titles, SUM(total_copies) as total_copies, SUM(available_copies) as total_available FROM books WHERE status = "active"'
    );

    // Active issues
    const activeIssues = await db.get(
      'SELECT COUNT(*) as count FROM transactions WHERE status = "issued"'
    );

    // Overdue count (calculate using current date)
    const allActiveLoans = await db.query(
      'SELECT due_date FROM transactions WHERE status = "issued"'
    );
    let overdueCount = 0;
    const now = new Date();
    for (const loan of allActiveLoans) {
      if (new Date(loan.due_date) < now) {
        overdueCount++;
      }
    }

    // Members count
    const studentCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "student" AND status = "active"');
    const facultyCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "faculty" AND status = "active"');

    // Active reservations
    const reservationsCount = await db.get(
      'SELECT COUNT(*) as count FROM reservations WHERE status IN ("pending", "ready_for_pickup")'
    );

    // Fine statistics
    const fineStats = await db.get(`
      SELECT 
        SUM(COALESCE(adjusted_fine, calculated_fine)) as total_fines,
        SUM(lost_damaged_charge) as total_lost_charges,
        SUM(total_paid) as total_collected
      FROM transactions
    `);

    res.json({
      success: true,
      stats: {
        totalTitles: bookStats?.total_titles || 0,
        totalCopies: bookStats?.total_copies || 0,
        availableCopies: bookStats?.total_available || 0,
        currentlyIssued: activeIssues?.count || 0,
        overdueCount,
        totalStudents: studentCount?.count || 0,
        totalFaculty: facultyCount?.count || 0,
        activeReservations: reservationsCount?.count || 0,
        totalFinesAccrued: Number(((fineStats?.total_fines || 0) + (fineStats?.total_lost_charges || 0)).toFixed(2)),
        totalFinesCollected: Number((fineStats?.total_collected || 0).toFixed(2))
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard metrics.',
      error: err.message
    });
  }
}

/**
 * Admin Fine Management: Waive or partially adjust a fine with required audit reason
 * Never silently overwrites original calculated fine!
 */
export async function adjustFine(req, res) {
  try {
    const { transactionId, adjustedFine, waiverReason, totalPaid } = req.body;
    const adminId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required.'
      });
    }

    if (waiverReason === undefined || waiverReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A valid audit reason is mandatory for fine adjustments or waivers.'
      });
    }

    const txn = await db.get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (!txn) {
      return res.status(404).json({
        success: false,
        message: 'Transaction record not found.'
      });
    }

    const newFine = adjustedFine !== undefined ? parseFloat(adjustedFine) : txn.calculated_fine;
    const paidAmount = totalPaid !== undefined ? parseFloat(totalPaid) : txn.total_paid;

    await db.run(
      `UPDATE transactions SET 
        adjusted_fine = ?,
        waiver_reason = ?,
        adjusted_by = ?,
        total_paid = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newFine, waiverReason.trim(), adminId, paidAmount, transactionId]
    );

    res.json({
      success: true,
      message: `Fine updated successfully. Original fine ₹${txn.calculated_fine} preserved for audit. Adjusted fine is ₹${newFine}.`,
      audit: {
        transactionId,
        originalFine: txn.calculated_fine,
        adjustedFine: newFine,
        waiverReason: waiverReason.trim(),
        adjustedByAdminId: adminId
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to adjust fine.',
      error: err.message
    });
  }
}

/**
 * Get all members (Students and Faculty) with live borrowing and fine status
 */
export async function getAllMembers(req, res) {
  try {
    const { role, search } = req.query;

    let sql = `
      SELECT u.id, u.member_id, u.name, u.email, u.role, u.department, u.phone, u.max_books_allowed, u.status, u.created_at,
        (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id AND t.status = 'issued') as active_borrowed_count,
        (SELECT COUNT(*) FROM reservations r WHERE r.user_id = u.id AND r.status IN ('pending', 'ready_for_pickup')) as active_reservations_count,
        (SELECT SUM(COALESCE(t.adjusted_fine, t.calculated_fine) + t.lost_damaged_charge - t.total_paid) FROM transactions t WHERE t.user_id = u.id) as pending_dues
      FROM users u
      WHERE u.role IN ('student', 'faculty')
    `;
    const params = [];

    if (role && role !== 'all') {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ' AND (u.name LIKE ? OR u.member_id LIKE ? OR u.department LIKE ?)';
      params.push(term, term, term);
    }

    sql += ' ORDER BY u.role ASC, u.member_id ASC';

    const members = await db.query(sql, params);

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve members list.',
      error: err.message
    });
  }
}

/**
 * Quick Counter Issue: Admin issues directly using Member ID (Roll No) and Book ISBN / ID
 */
export async function quickCounterIssue(req, res) {
  try {
    const { memberIdentifier, bookIdentifier } = req.body;

    if (!memberIdentifier || !bookIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Both Member Roll Number / ID and Book ISBN / ID are required.'
      });
    }

    // 1. Locate member
    const member = await db.get(
      'SELECT * FROM users WHERE (member_id = ? OR email = ?) AND status = ?',
      [memberIdentifier.trim(), memberIdentifier.trim(), 'active']
    );
    if (!member) {
      return res.status(404).json({
        success: false,
        message: `Member "${memberIdentifier}" not found or account is not active.`
      });
    }

    // 2. Locate book
    const book = await db.get(
      'SELECT * FROM books WHERE (isbn = ? OR id = ?) AND status = ?',
      [bookIdentifier.trim(), bookIdentifier.trim(), 'active']
    );
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book "${bookIdentifier}" not found or inactive in catalog.`
      });
    }

    // 3. Delegate to issue transaction logic
    const issueDate = new Date();
    const dueDate = calculateDueDate(issueDate);

    const issueResult = await db.transaction(async (tx) => {
      // Check quota
      const activeIssues = await tx.get(
        "SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = 'issued'",
        [member.id]
      );
      if (activeIssues.count >= member.max_books_allowed) {
        throw new Error(`Member quota reached (${activeIssues.count}/${member.max_books_allowed} books).`);
      }

      // Check available copies
      if (book.available_copies <= 0) {
        throw new Error(`No available copies of "${book.title}" on shelf.`);
      }

      // Check existing active issue
      const existing = await tx.get(
        "SELECT id FROM transactions WHERE user_id = ? AND book_id = ? AND status = 'issued'",
        [member.id, book.id]
      );
      if (existing) {
        throw new Error(`Member already has an active issued copy of "${book.title}".`);
      }

      // Decrement available copies
      await tx.run('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book.id]);

      // Insert transaction
      const txn = await tx.run(
        `INSERT INTO transactions (user_id, book_id, issue_date, due_date, status, notes)
         VALUES (?, ?, ?, ?, 'issued', ?)`,
        [
          member.id,
          book.id,
          formatDbDate(issueDate),
          formatDbDate(dueDate),
          `Counter issue processed by Admin ID ${req.user.member_id}`
        ]
      );

      // Fulfill reservation if applicable
      await tx.run(
        "UPDATE reservations SET status = 'fulfilled', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'ready_for_pickup')",
        [member.id, book.id]
      );

      return txn.lastInsertRowid;
    });

    res.status(201).json({
      success: true,
      message: `Successfully issued "${book.title}" to ${member.name} (${member.member_id}). Due in 15 days on ${formatDbDate(dueDate).split(' ')[0]}.`,
      transactionId: issueResult
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Counter issue failed.'
    });
  }
}
