import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jntua_clms_super_secret_jwt_key_2024_anantapur';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * User Login (supports Member ID / Roll No / Email and password)
 */
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Roll Number / Member ID / Email and password.'
      });
    }

    const trimmed = identifier.trim();

    // Find user by member_id or email
    const user = await db.get(
      'SELECT * FROM users WHERE (member_id = ? OR email = ?) AND status = ?',
      [trimmed, trimmed, 'active']
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive account. Please check your Roll No/Email.'
      });
    }

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        member_id: user.member_id,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Exclude password hash from response
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login authentication.',
      error: err.message
    });
  }
}

/**
 * Get currently authenticated user profile with active borrowing summary
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    // Get current active loans count
    const activeLoans = await db.get(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = ?',
      [userId, 'issued']
    );

    // Get active reservations count
    const activeReservations = await db.get(
      "SELECT COUNT(*) as count FROM reservations WHERE user_id = ? AND status IN ('pending', 'ready_for_pickup')",
      [userId]
    );

    // Calculate total outstanding fines
    const fineStats = await db.get(
      'SELECT SUM(calculated_fine) as total_fines, SUM(total_paid) as total_paid FROM transactions WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      user: req.user,
      stats: {
        currentBorrowed: activeLoans?.count || 0,
        activeReservations: activeReservations?.count || 0,
        totalFines: Number((fineStats?.total_fines || 0).toFixed(2)),
        totalPaid: Number((fineStats?.total_paid || 0).toFixed(2)),
        maxAllowed: req.user.max_books_allowed
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: err.message
    });
  }
}

/**
 * Helper endpoint for Viva Examiners & Demo testers to fetch quick logins
 */
export async function getDemoAccounts(req, res) {
  try {
    const demoUsers = await db.query(
      "SELECT member_id, name, email, role, department, max_books_allowed FROM users WHERE status = 'active' ORDER BY role ASC, id ASC"
    );

    res.json({
      success: true,
      defaultPassword: 'jntua@123',
      accounts: demoUsers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve demo accounts.',
      error: err.message
    });
  }
}
