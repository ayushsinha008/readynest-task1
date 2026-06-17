import { Request, Response, NextFunction } from 'express';
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

        const emailResult = await sendEmail({
          to: userExists.email,
          subject: 'Verify your FormBuilder account',
          text: `Your OTP is: ${otpCode}. It will expire in 10 minutes.`,
        });

        return res.status(200).json({
          success: true,
          message: 'OTP sent to email',
          email: userExists.email,
          previewUrl: emailResult?.previewUrl
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

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Verify your FormBuilder account',
      text: `Your OTP is: ${otpCode}. It will expire in 10 minutes.`,
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent to email',
      email: user.email,
      previewUrl: emailResult?.previewUrl
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

    const { accessToken, refreshToken } = generateTokens(res, user._id as string);

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
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
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

    if (!user.otpCode || user.otpCode !== otp.toString()) {
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

    const { accessToken, refreshToken } = generateTokens(res, user._id as string);

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

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Verify your FormBuilder account',
      text: `Your new OTP is: ${otpCode}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ 
      success: true, 
      message: 'New OTP sent to email',
      previewUrl: emailResult?.previewUrl
    });
  } catch (error) {
    next(error);
  }
};

// Simplified Forgot Password / Reset Password for prototype
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }

    // In a real app, generate a reset token and send an email
    console.log(`Reset password link: http://localhost:5173/reset-password/${user._id}`);
    
    res.status(200).json({ success: true, message: 'Password reset link sent to email (check console)' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    // Using user id as token for simplification
    const user = await User.findById(req.params.resetToken);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
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
