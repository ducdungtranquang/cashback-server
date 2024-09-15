import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.route';
import cartRoutes from './routes/cart.routes';
import purchaseHistoryRoutes from './routes/purchaseHistory.routes';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import './config/passport';

dotenv.config();
connectDB();

const app = express();

// Cấu hình CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchase-history', purchaseHistoryRoutes);

export default app;
