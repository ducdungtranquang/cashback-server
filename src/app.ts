import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import purchaseHistoryRoutes from './routes/purchaseHistory.routes';
import passport from 'passport';
import session from 'express-session';
import './config/passport';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchase-history', purchaseHistoryRoutes);

export default app;
