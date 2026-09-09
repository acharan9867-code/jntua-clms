import db from '../config/db.js';

/**
 * Get all books with forgiving multi-field search and filters
 */
export async function getBooks(req, res) {
  try {
    const { search, category, availableOnly, sortBy, sortOrder } = req.query;

    let sql = `
      SELECT b.*, c.name as category_name, c.code as category_code,
        (SELECT COUNT(*) FROM reservations r WHERE r.book_id = b.id AND r.status = 'pending') as pending_reservations
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'active'
    `;
    const params = [];

    // Forgiving multi-field search: partial title, author, or ISBN
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
      params.push(term, term, term);
    }

    // Filter by Category
    if (category && category !== 'all') {
      sql += ` AND (c.code = ? OR c.id = ?)`;
      params.push(category, category);
    }

    // Filter by Availability
    if (availableOnly === 'true' || availableOnly === true) {
      sql += ` AND b.available_copies > 0`;
    }

    // Sorting
    const validSortFields = {
      title: 'b.title',
      author: 'b.author',
      copies: 'b.available_copies',
      newest: 'b.id'
    };
    const orderField = validSortFields[sortBy] || 'b.id';
    const direction = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${orderField} ${direction}`;

    const books = await db.query(sql, params);

    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (err) {
    console.error('getBooks error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve book catalog.',
      error: err.message
    });
  }
}

/**
 * Get complete details of a single book
 */
export async function getBookById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const book = await db.get(
      `SELECT b.*, c.name as category_name, c.code as category_code
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id]
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    // Active reservation queue count
    const queueInfo = await db.get(
      "SELECT COUNT(*) as queue_length FROM reservations WHERE book_id = ? AND status = 'pending'",
      [id]
    );

    // Check if the current user already borrowed or reserved this book
    let userBorrowed = false;
    let userReserved = false;
    let userQueuePos = null;

    if (userId) {
      const activeBorrow = await db.get(
        "SELECT id FROM transactions WHERE user_id = ? AND book_id = ? AND status = 'issued'",
        [userId, id]
      );
      userBorrowed = !!activeBorrow;

      const activeRes = await db.get(
        "SELECT queue_position, status FROM reservations WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'ready_for_pickup')",
        [userId, id]
      );
      if (activeRes) {
        userReserved = true;
        userQueuePos = activeRes.queue_position;
      }
    }

    res.json({
      success: true,
      book: {
        ...book,
        pending_reservations: queueInfo?.queue_length || 0,
        user_already_borrowed: userBorrowed,
        user_already_reserved: userReserved,
        user_queue_position: userQueuePos
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve book details.',
      error: err.message
    });
  }
}

/**
 * Add a new book to the inventory (Admin only)
 */
export async function createBook(req, res) {
  try {
    const {
      title,
      author,
      isbn,
      category_id,
      price,
      description,
      total_copies,
      shelf_location,
      cover_image
    } = req.body;

    if (!title || !author || !isbn || !category_id || !total_copies || !shelf_location || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Title, Author, ISBN, Category, Total Copies, Shelf Location, and Description) are required.'
      });
    }

    // Check if ISBN already exists
    const existing = await db.get('SELECT id FROM books WHERE isbn = ?', [isbn.trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A book with ISBN ${isbn} already exists in the catalog.`
      });
    }

    const copies = parseInt(total_copies, 10);
    const bookPrice = parseFloat(price) || 500.00;
    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

    const result = await db.run(
      `INSERT INTO books (title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), author.trim(), isbn.trim(), category_id, bookPrice, description.trim(), copies, copies, shelf_location.trim(), defaultCover, 'active']
    );

    res.status(201).json({
      success: true,
      message: `Book "${title}" added successfully to JNTUA Central Library catalog.`,
      bookId: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add book.',
      error: err.message
    });
  }
}

/**
 * Update book details (Admin only)
 */
export async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      isbn,
      category_id,
      price,
      description,
      total_copies,
      available_copies,
      shelf_location,
      cover_image,
      status
    } = req.body;

    const existing = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    await db.run(
      `UPDATE books SET 
        title = COALESCE(?, title),
        author = COALESCE(?, author),
        isbn = COALESCE(?, isbn),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        description = COALESCE(?, description),
        total_copies = COALESCE(?, total_copies),
        available_copies = COALESCE(?, available_copies),
        shelf_location = COALESCE(?, shelf_location),
        cover_image = COALESCE(?, cover_image),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, author, isbn, category_id, price, description, total_copies, available_copies, shelf_location, cover_image, status, id]
    );

    res.json({
      success: true,
      message: 'Book updated successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update book.',
      error: err.message
    });
  }
}

/**
 * Deactivate / Soft Delete book (Admin only)
 */
export async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    // Check if book has active issued copies
    const activeLoan = await db.get(
      "SELECT COUNT(*) as count FROM transactions WHERE book_id = ? AND status = 'issued'",
      [id]
    );

    if (activeLoan && activeLoan.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deactivate book: ${activeLoan.count} copies are currently issued to students/faculty.`
      });
    }

    await db.run("UPDATE books SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);

    res.json({
      success: true,
      message: 'Book has been deactivated from active catalog.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate book.',
      error: err.message
    });
  }
}

/**
 * Get list of academic categories
 */
export async function getCategories(req, res) {
  try {
    const categories = await db.query(
      `SELECT c.*, COUNT(b.id) as book_count 
       FROM categories c
       LEFT JOIN books b ON b.category_id = c.id AND b.status = 'active'
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
      error: err.message
    });
  }
}
