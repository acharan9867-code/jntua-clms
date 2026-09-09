import db from '../config/db.js';
import { calculateFine } from '../utils/fineCalculator.js';

/**
 * Report 1: Overdue Books
 * Lists all active issues where due_date < current date with live calculated fine
 */
export async function getOverdueReport(req, res) {
  try {
    const activeLoans = await db.query(`
      SELECT t.*, b.title as book_title, b.author as book_author, b.isbn, b.shelf_location,
        u.name as user_name, u.member_id, u.email as user_email, u.role as user_role, u.department
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'issued'
      ORDER BY t.due_date ASC
    `);

    const overdueList = [];
    for (const loan of activeLoans) {
      const fineData = calculateFine(loan.due_date);
      if (fineData.isOverdue) {
        overdueList.push({
          ...loan,
          days_overdue: fineData.overdueDays,
          calculated_fine: fineData.fineAmount
        });
      }
    }

    res.json({
      success: true,
      count: overdueList.length,
      overdueList
    });
  } catch (err) {
    console.error('getOverdueReport error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overdue report.',
      error: err.message
    });
  }
}

/**
 * Report 2: Most Borrowed Books
 * Aggregates transactions grouped by book
 */
export async function getMostBorrowedReport(req, res) {
  try {
    const report = await db.query(`
      SELECT b.id, b.title, b.author, b.isbn, b.shelf_location, b.cover_image,
        c.name as category_name,
        COUNT(t.id) as borrow_count,
        b.total_copies,
        b.available_copies
      FROM books b
      LEFT JOIN transactions t ON t.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      GROUP BY b.id
      ORDER BY borrow_count DESC, b.title ASC
      LIMIT 20
    `);

    res.json({
      success: true,
      report
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate most borrowed books report.',
      error: err.message
    });
  }
}

/**
 * Report 3: Category-wise Statistics
 * Aggregates number of titles, total copies, available copies, and total borrows
 */
export async function getCategoryReport(req, res) {
  try {
    const report = await db.query(`
      SELECT c.id, c.name, c.code,
        COUNT(DISTINCT b.id) as total_titles,
        COALESCE(SUM(b.total_copies), 0) as total_copies,
        COALESCE(SUM(b.available_copies), 0) as available_copies,
        (
          SELECT COUNT(t.id) 
          FROM transactions t 
          JOIN books bk ON t.book_id = bk.id 
          WHERE bk.category_id = c.id
        ) as total_borrows
      FROM categories c
      LEFT JOIN books b ON b.category_id = c.id AND b.status = 'active'
      GROUP BY c.id
      ORDER BY total_borrows DESC, total_titles DESC
    `);

    res.json({
      success: true,
      report
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate category statistics report.',
      error: err.message
    });
  }
}

/**
 * Report 4: Complete Borrowing Transaction History & Audit
 */
export async function getTransactionHistory(req, res) {
  try {
    const { status, search, startDate, endDate } = req.query;

    let sql = `
      SELECT t.*, b.title as book_title, b.author as book_author, b.isbn, b.shelf_location,
        u.name as user_name, u.member_id, u.role as user_role, u.department,
        admin_u.name as adjusted_by_name
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users admin_u ON t.adjusted_by = admin_u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ' AND (b.title LIKE ? OR b.isbn LIKE ? OR u.name LIKE ? OR u.member_id LIKE ?)';
      params.push(term, term, term, term);
    }

    if (startDate) {
      sql += ' AND t.issue_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND t.issue_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY t.id DESC LIMIT 100';

    const history = await db.query(sql, params);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction history.',
      error: err.message
    });
  }
}
