import { Router } from 'express';
import passport from 'passport';
import { registerUser, authUser } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', authUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect or respond with token
        res.redirect('/'); // Or respond with token
    }
);

export default router;
