import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Import Routes
import authRoutes from './routes/auth.routes';
import formRoutes from './routes/form.routes';
import responseRoutes from './routes/response.routes';
import analyticsRoutes from './routes/analytics.routes';
import publicRoutes from './routes/public.routes';

// Import Middleware
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

// Connect to Database
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
