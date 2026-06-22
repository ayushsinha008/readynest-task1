import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, forgotPassword, resetPassword, getProfile, updateProfile, updatePassword, verifyOTP, resendOTP } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from '../schemas/auth.schema';

const router = express.Router();

// Strict rate limiter: max 5 attempts per 15 minutes for sensitive auth routes
const sensitiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/register', validate(registerSchema), register);
router.post('/login', sensitiveRateLimit, validate(loginSchema), login);
router.post('/verify-otp', sensitiveRateLimit, verifyOTP);
router.post('/resend-otp', sensitiveRateLimit, resendOTP);
router.post('/logout', logout);
router.post('/forgot-password', sensitiveRateLimit, forgotPassword);
router.post('/reset-password/:resetToken', sensitiveRateLimit, resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/password', protect, validate(updatePasswordSchema), updatePassword);

export default router;
