import express from 'express';
import {
  issueBook,
  returnBook,
  reportLostOrDamaged,
  getUserTransactions
} from '../controllers/transactionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/issue', issueBook);
router.post('/return', returnBook);
router.post('/lost-damaged', reportLostOrDamaged);
router.get('/my-transactions', getUserTransactions);

export default router;
