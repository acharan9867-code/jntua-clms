import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingsController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', verifyToken, requireRole(['admin']), updateSetting);

export default router;
