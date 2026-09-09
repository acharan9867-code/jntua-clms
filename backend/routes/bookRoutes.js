import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories
} from '../controllers/bookController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional token check for getBookById to personalize borrow/reservation status
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getBookById);

// Admin-only Inventory management
router.post('/', verifyToken, requireRole(['admin']), createBook);
router.put('/:id', verifyToken, requireRole(['admin']), updateBook);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteBook);

export default router;
