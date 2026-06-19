import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import connectDB from './config/db';

// Import Routes
import authRoutes from './routes/auth.routes';
import formRoutes from './routes/form.routes';
import responseRoutes from './routes/response.routes';
import analyticsRoutes from './routes/analytics.routes';
import publicRoutes from './routes/public.routes';
import subscriptionRoutes from './routes/subscription.routes';

// Import Middleware
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

// Connect to Database
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Setup HTTP server conditionally
const httpServer = createServer(app);

// Initialize Socket.io only if NOT on Vercel
let io;
if (!process.env.VERCEL) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    }
  });
  
  app.set('io', io);
  
  io.on('connection', (socket) => {
    console.log('Socket client connected:', socket.id);
    socket.on('join', (userId) => {
      console.log('Socket client joined room:', userId);
      socket.join(userId);
    });
  });
} else {
  // Dummy io object for Vercel to prevent crashes in controllers
  app.set('io', {
    to: () => ({ emit: () => {} }),
    emit: () => {}
  });
}

// Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'production' ? 500 : 5000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize data (must be after body parsers)
// app.use(mongoSanitize()); // Disabled due to Express 5 compatibility issue (Cannot set property query of #<IncomingMessage> which has only a getter)
app.use(hpp());

app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error Handling Middleware
app.use(errorHandler);

if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
