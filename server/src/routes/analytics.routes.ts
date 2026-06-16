import express from 'express';
import { getDashboardStats } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/dashboard').get(getDashboardStats);

export default router;
