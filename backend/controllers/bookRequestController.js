import db from '../config/db.js';

/** Submit a new book request (students and faculty) */
export async function submitRequest(req, res) {
  try {
    const userId = req.user.id;
    const {
      title, author, isbn, publisher, edition, year_published,
      category_id, department, reason, priority = 'normal',
      copies_requested = 2, estimated_price
    } = req.body;

    if (!title || !author || !reason) {
      return res.status(400).json({ success: false, message: 'Title, author, and reason are required.' });
    }

    // Check if same title already requested by this user and still pending
    const existing = await db.get(
      "SELECT id FROM book_requests WHERE user_id = ? AND LOWER(title) = LOWER(?) AND status = 'pending'",
      [userId, title]
    );
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have a pending request for this book.' });
    }

    const result = await db.run(
      `INSERT INTO book_requests 
       (user_id, title, author, isbn, publisher, edition, year_published, category_id, department, reason, priority, copies_requested, estimated_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, title, author, isbn || null, publisher || null, edition || null,
       year_published || null, category_id || null, department || req.user.department,
       reason, priority, copies_requested, estimated_price || null]
    );

    res.status(201).json({
      success: true,
      message: 'Book request submitted successfully! The librarian will review it shortly.',
      requestId: result.lastID
    });
  } catch (err) {
    console.error('Book request error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit request.', error: err.message });
  }
}

/** Get requests — admin sees all, users see their own */
export async function getRequests(req, res) {
  try {
    const { status, search } = req.query;
    const isAdmin = req.user.role === 'admin';

    let sql = `
      SELECT br.*, 
             u.name as requester_name, u.member_id as requester_member_id, u.department as requester_dept, u.role as requester_role,
             c.name as category_name,
             a.name as reviewer_name
      FROM book_requests br
      JOIN users u ON br.user_id = u.id
      LEFT JOIN categories c ON br.category_id = c.id
      LEFT JOIN users a ON br.reviewed_by = a.id
    `;
    const params = [];

    if (!isAdmin) {
      sql += ' WHERE br.user_id = ?';
      params.push(req.user.id);
      if (status) { sql += ' AND br.status = ?'; params.push(status); }
    } else {
      if (status) { sql += ' WHERE br.status = ?'; params.push(status); }
      if (search) {
        sql += (params.length ? ' AND' : ' WHERE') + ' (br.title LIKE ? OR br.author LIKE ? OR u.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
    }

    sql += ' ORDER BY br.requested_at DESC';
    const requests = await db.query(sql, params);

    // Stats for admin
    let stats = null;
    if (isAdmin) {
      const s = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status='ordered' THEN 1 ELSE 0 END) as ordered
        FROM book_requests`);
      stats = s;
    }

    res.json({ success: true, requests, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests.', error: err.message });
  }
}

/** Admin: Approve a request (optionally auto-add book to catalog) */
export async function approveRequest(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });

    const { id } = req.params;
    const { admin_comment, add_to_catalog = false, shelf_location, copies } = req.body;

    const request = await db.get('SELECT * FROM book_requests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already reviewed.' });

    const now = new Date().toISOString();

    await db.run(
      `UPDATE book_requests SET status = 'approved', admin_comment = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?`,
      [admin_comment || 'Approved by librarian.', req.user.id, now, now, id]
    );

    // Optionally auto-add the book to the catalog
    if (add_to_catalog) {
      const numCopies = copies || request.copies_requested || 2;
      await db.run(
        `INSERT OR IGNORE INTO books (title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.title, request.author,
          request.isbn || ('REQ-' + Date.now()),
          request.category_id || 1,
          request.estimated_price || 500,
          `Requested by ${request.department || 'a department'}. ${admin_comment || ''}`.trim(),
          numCopies, numCopies,
          shelf_location || 'NEW-ARRIVAL-RACK',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80'
        ]
      );

      await db.run("UPDATE book_requests SET status = 'ordered' WHERE id = ?", [id]);
    }

    res.json({ success: true, message: add_to_catalog ? 'Request approved and book added to catalog!' : 'Request approved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve request.', error: err.message });
  }
}

/** Admin: Reject a request with reason */
export async function rejectRequest(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });

    const { id } = req.params;
    const { admin_comment } = req.body;
    if (!admin_comment) return res.status(400).json({ success: false, message: 'Please provide a reason for rejection.' });

    const request = await db.get('SELECT * FROM book_requests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already reviewed.' });

    const now = new Date().toISOString();
    await db.run(
      "UPDATE book_requests SET status = 'rejected', admin_comment = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?",
      [admin_comment, req.user.id, now, now, id]
    );

    res.json({ success: true, message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject request.', error: err.message });
  }
}

/** Cancel own pending request */
export async function cancelRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await db.get('SELECT * FROM book_requests WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled.' });

    await db.run("UPDATE book_requests SET status = 'rejected', admin_comment = 'Cancelled by requester.' WHERE id = ?", [id]);
    res.json({ success: true, message: 'Request cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel request.', error: err.message });
  }
}
