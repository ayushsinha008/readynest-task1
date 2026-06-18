import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateTokens = (res: Response, userId: string) => {
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_123';
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_123';

  const accessToken = jwt.sign({ id: userId }, accessTokenSecret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id: userId }, refreshTokenSecret, {
    expiresIn: '7d',
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
};
