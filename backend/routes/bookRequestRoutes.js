import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { submitRequest, getRequests, approveRequest, rejectRequest, cancelRequest } from '../controllers/bookRequestController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', submitRequest);
router.get('/', getRequests);
router.put('/:id/approve', requireRole('admin'), approveRequest);
router.put('/:id/reject', requireRole('admin'), rejectRequest);
router.delete('/:id', cancelRequest);

export default router;
