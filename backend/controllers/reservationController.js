import db from '../config/db.js';
import { formatDbDate } from '../utils/fineCalculator.js';

/**
 * Place a queue reservation for an unavailable book (available_copies = 0)
 */
export async function createReservation(req, res) {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required to place a reservation.'
      });
    }

    const reservation = await db.transaction(async (tx) => {
      // 1. Verify book existence and current availability
      const book = await tx.get('SELECT * FROM books WHERE id = ? AND status = ?', [bookId, 'active']);
      if (!book) {
        throw new Error('Book not found in active catalog.');
      }

      if (book.available_copies > 0) {
        throw new Error(`Copies are currently available (${book.available_copies} on shelf). You can issue this book directly instead of reserving.`);
      }

      // 2. Prevent duplicate active reservation
      const existing = await tx.get(
        "SELECT id FROM reservations WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'ready_for_pickup')",
        [userId, bookId]
      );
      if (existing) {
        throw new Error('You already have an active reservation for this book.');
      }

      // 3. Prevent reservation if user already has an active issued copy
      const currentIssue = await tx.get(
        "SELECT id FROM transactions WHERE user_id = ? AND book_id = ? AND status = 'issued'",
        [userId, bookId]
      );
      if (currentIssue) {
        throw new Error('You currently have an active borrowed copy of this book.');
      }

      // 4. Calculate queue position (current max pending position + 1)
      const maxPos = await tx.get(
        "SELECT COALESCE(MAX(queue_position), 0) as max_pos FROM reservations WHERE book_id = ? AND status = 'pending'",
        [bookId]
      );
      const nextPosition = (maxPos?.max_pos || 0) + 1;

      // 5. Insert reservation
      const insertResult = await tx.run(
        `INSERT INTO reservations (user_id, book_id, queue_position, status, reservation_date)
         VALUES (?, ?, ?, 'pending', ?)`,
        [userId, bookId, nextPosition, formatDbDate()]
      );

      return {
        reservationId: insertResult.lastInsertRowid,
        bookTitle: book.title,
        queuePosition: nextPosition
      };
    });

    res.status(201).json({
      success: true,
      message: `Reservation placed successfully! You are at Queue Position #${reservation.queuePosition} for "${reservation.bookTitle}".`,
      reservation
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to place reservation.'
    });
  }
}

/**
 * Cancel an active reservation
 */
export async function cancelReservation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    await db.transaction(async (tx) => {
      const reservation = await tx.get(
        "SELECT * FROM reservations WHERE id = ? AND status IN ('pending', 'ready_for_pickup')",
        [id]
      );

      if (!reservation) {
        throw new Error('Active reservation not found.');
      }

      if (!isAdmin && reservation.user_id !== userId) {
        throw new Error('Unauthorized to cancel this reservation.');
      }

      // Mark cancelled
      await tx.run(
        "UPDATE reservations SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id]
      );

      // Re-order queue positions for remaining pending reservations for this book
      const remaining = await tx.query(
        "SELECT id FROM reservations WHERE book_id = ? AND status = 'pending' ORDER BY queue_position ASC, id ASC",
        [reservation.book_id]
      );

      for (let i = 0; i < remaining.length; i++) {
        await tx.run(
          'UPDATE reservations SET queue_position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [i + 1, remaining[i].id]
        );
      }
    });

    res.json({
      success: true,
      message: 'Reservation cancelled successfully.'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to cancel reservation.'
    });
  }
}

/**
 * Get logged-in user's reservations (including 'ready_for_pickup' alerts)
 */
export async function getUserReservations(req, res) {
  try {
    const userId = req.user.id;

    const reservations = await db.query(
      `SELECT r.*, b.title as book_title, b.author as book_author, b.isbn, b.shelf_location, b.cover_image,
        b.available_copies
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = ?
       ORDER BY CASE r.status
         WHEN 'ready_for_pickup' THEN 1
         WHEN 'pending' THEN 2
         ELSE 3
       END, r.queue_position ASC, r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      reservations
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reservations.',
      error: err.message
    });
  }
}

/**
 * Admin view of all reservations across all books
 */
export async function getAllReservations(req, res) {
  try {
    const reservations = await db.query(
      `SELECT r.*, b.title as book_title, b.isbn, b.available_copies, u.name as user_name, u.member_id, u.role as user_role, u.department
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      reservations
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve all reservations.',
      error: err.message
    });
  }
}
