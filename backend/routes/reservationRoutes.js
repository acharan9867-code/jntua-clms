import express from 'express';
import {
  createReservation,
  cancelReservation,
  getUserReservations,
  getAllReservations
} from '../controllers/reservationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createReservation);
router.delete('/:id', cancelReservation);
router.get('/my-reservations', getUserReservations);
router.get('/all', requireRole(['admin']), getAllReservations);

export default router;
