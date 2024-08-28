import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

export default app;
