-- =====================================================================
-- JNTUA CENTRAL LIBRARY MANAGEMENT SYSTEM (CLMS)
-- Pure MySQL 8.0+ Schema (InnoDB Engine with Constraints & Indexes)
-- Use this file to import directly into MySQL Workbench or phpMyAdmin (XAMPP)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS jntua_clms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jntua_clms;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id VARCHAR(50) NOT NULL UNIQUE, -- Roll No (21001A0501) or Faculty ID (JNTUA-FAC-101)
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  max_books_allowed INT NOT NULL DEFAULT 3,
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Books Table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(30) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  description TEXT NOT NULL,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  shelf_location VARCHAR(50) NOT NULL,
  cover_image TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_books_isbn (isbn),
  INDEX idx_books_category (category_id)
) ENGINE=InnoDB;

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  issue_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  return_date DATETIME,
  status ENUM('issued', 'returned', 'lost', 'damaged') NOT NULL DEFAULT 'issued',
  calculated_fine DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  lost_damaged_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  adjusted_fine DECIMAL(10, 2),
  waiver_reason TEXT,
  adjusted_by INT,
  total_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_transactions_user (user_id),
  INDEX idx_transactions_book (book_id),
  INDEX idx_transactions_status (status)
) ENGINE=InnoDB;

-- 5. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  queue_position INT NOT NULL DEFAULT 1,
  status ENUM('pending', 'ready_for_pickup', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending',
  notified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_reservations_book_status (book_id, status)
) ENGINE=InnoDB;

-- 6. Library Settings Table
CREATE TABLE IF NOT EXISTS library_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
