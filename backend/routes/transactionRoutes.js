import express from 'express';
import {
  issueBook,
  returnBook,
  reportLostOrDamaged,
  getUserTransactions
} from '../controllers/transactionController.js';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow issue with optional token (or direct student details in body)
router.post('/issue', optionalAuth, issueBook);

// Other endpoints require valid token
router.post('/return', verifyToken, returnBook);
router.post('/lost-damaged', verifyToken, reportLostOrDamaged);
router.get('/my-transactions', verifyToken, getUserTransactions);

export default router;
