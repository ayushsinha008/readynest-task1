import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateTokens } from '../utils/generateToken';
import { sendEmail } from '../utils/sendEmail';

// Helper to generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      } else {
        // User exists but unverified. Let's update their OTP and resend
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        
        userExists.otpCode = otpCode;
        userExists.otpExpires = otpExpires;
        // Optionally update password if they are trying to register again
        userExists.password = password; 
        await userExists.save();

        await sendEmail({
          to: userExists.email,
          subject: 'Verify your FormBuilder account',
          text: `Your OTP is: ${otpCode}. It will expire in 10 minutes.`,
        });

        return res.status(200).json({
          success: true,
          message: 'OTP sent to email',
          email: userExists.email
        });
      }
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({ 
      name, 
      email, 
      password,
      isVerified: false,
      otpCode,
      otpExpires
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify your FormBuilder account',
      text: `Your OTP is: ${otpCode}. It will expire in 10 minutes.`,
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent to email',
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +isVerified');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Security: Block unverified users from logging in
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const { accessToken, refreshToken } = generateTokens(res, (user._id as any).toString());

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email }).select('+otpCode +otpExpires');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    const cleanOtp = otp.toString().trim();
    if (!user.otpCode || user.otpCode !== cleanOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Success! Verify user
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(res, (user._id as any).toString());

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Verify your FormBuilder account',
      text: `Your new OTP is: ${otpCode}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ 
      success: true, 
      message: 'New OTP sent to email'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Security: Always return same message to prevent email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - FormBuilder',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    });

    res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    
    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(String(req.params.resetToken)).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token. Please request a new one.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar,
        plan: user.plan
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = req.user.id;

    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
    }

    // Security: Validate avatar is a valid image data URL and not too large (max 2MB as base64)
    if (avatar !== undefined && avatar !== null && avatar !== '') {
      if (!avatar.startsWith('data:image/')) {
        return res.status(400).json({ success: false, message: 'Invalid avatar format. Must be an image.' });
      }
      // base64 size check: 2MB raw = ~2.73MB base64
      if (avatar.length > 3 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Avatar image is too large. Maximum size is 2MB.' });
      }
    }

    // We only update fields that are provided
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        plan: updatedUser.plan
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
