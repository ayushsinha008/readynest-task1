import express from 'express';
import { createCheckoutSession, getSubscriptionStatus, handleWebhook } from '../controllers/subscription.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Webhook needs raw body, not JSON. It will be parsed in index.ts before the global JSON parser.
// But we mount it here for consistency. It requires the raw body middleware to have been run.
router.post('/webhook', handleWebhook);

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/status', protect, getSubscriptionStatus);

export default router;
