import express from 'express';
import { getDashboardStats, getNotifications } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/dashboard').get(getDashboardStats);
router.route('/notifications').get(getNotifications);

export default router;
