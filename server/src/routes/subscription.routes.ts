import express from 'express';
import { createPayuHash, getSubscriptionStatus, payuSuccessCallback, payuFailureCallback } from '../controllers/subscription.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create-payu-hash', protect, createPayuHash);
router.post('/payu-success', payuSuccessCallback);
router.post('/payu-failure', payuFailureCallback);

router.get('/status', protect, getSubscriptionStatus);

export default router;
