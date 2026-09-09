import express from 'express';
import {
  getDashboardStats,
  adjustFine,
  getAllMembers,
  quickCounterIssue
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRole(['admin']));

router.get('/stats', getDashboardStats);
router.post('/fines/adjust', adjustFine);
router.get('/members', getAllMembers);
router.post('/counter-issue', quickCounterIssue);

export default router;
