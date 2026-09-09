-- =====================================================================
-- JNTUA CENTRAL LIBRARY MANAGEMENT SYSTEM (CLMS)
-- Relational Database Schema (MySQL 8.0+ / SQLite Compatible DDL)
-- Jawaharlal Nehru Technological University Anantapur
-- =====================================================================

-- 1. Categories Table (Engineering Departments & Specializations)
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Students, Faculty, and Library Admin Staff)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id VARCHAR(50) NOT NULL UNIQUE, -- Roll Number (e.g. 21001A0501) or Employee ID (e.g. JNTUA-FAC-101)
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  max_books_allowed INTEGER NOT NULL DEFAULT 3,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Books Table (Catalog with syllabus-aligned description & shelf tracking)
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(30) NOT NULL UNIQUE,
  category_id INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  description TEXT NOT NULL,
  total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
  available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  shelf_location VARCHAR(50) NOT NULL, -- e.g. CSE-RACK-03-B
  cover_image TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 4. Transactions Table (Core Issue, Return, Lost & Damaged Records)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  issue_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,          -- issue_date + 15 days
  return_date DATETIME,
  status VARCHAR(20) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'lost', 'damaged')),
  calculated_fine DECIMAL(10, 2) NOT NULL DEFAULT 0.00,  -- ₹1 per overdue day
  lost_damaged_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- ₹300 fixed penalty if lost/damaged
  adjusted_fine DECIMAL(10, 2),        -- Adjusted fine set by Admin
  waiver_reason TEXT,                  -- Required reason for fine waiver or adjustment
  adjusted_by INTEGER,                 -- Admin ID who approved adjustment
  total_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Reservations Table (Queue-Based Reservation System)
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  queue_position INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready_for_pickup', 'fulfilled', 'cancelled')),
  notified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 6. Library Settings Table (Configurable Timings, Policies & Thresholds)
CREATE TABLE IF NOT EXISTS library_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance searching and foreign keys
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_book ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_reservations_book_status ON reservations(book_id, status);
