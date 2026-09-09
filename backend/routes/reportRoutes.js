import express from 'express';
import {
  getOverdueReport,
  getMostBorrowedReport,
  getCategoryReport,
  getTransactionHistory
} from '../controllers/reportController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRole(['admin']));

router.get('/overdue', getOverdueReport);
router.get('/most-borrowed', getMostBorrowedReport);
router.get('/categories', getCategoryReport);
router.get('/history', getTransactionHistory);

export default router;
