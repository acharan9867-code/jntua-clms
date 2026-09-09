import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jntua_clms_super_secret_jwt_key_2024_anantapur';

/**
 * Middleware to verify JWT authentication token
 */
export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch live user from database
    const user = await db.get(
      'SELECT id, member_id, name, email, role, department, phone, max_books_allowed, status FROM users WHERE id = ? AND status = ?',
      [decoded.id, 'active']
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user account is inactive.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
      error: err.message
    });
  }
}

/**
 * Middleware to enforce role-based authorization
 * @param {string[]} allowedRoles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Action requires one of: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
