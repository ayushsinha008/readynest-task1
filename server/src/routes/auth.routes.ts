import express from 'express';
import { register, login, logout, forgotPassword, resetPassword, getProfile, updateProfile, updatePassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from '../schemas/auth.schema';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/password', protect, validate(updatePasswordSchema), updatePassword);

export default router;
