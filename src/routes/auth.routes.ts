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
        const user = req.user as any;

        if (user) {
            res.cookie('authToken', user.token, {
                path: '/',
            });
            res.cookie('email', user.email, {
                path: '/',
            });
            res.cookie('id', user._id, {
                path: '/',
            });

            res.redirect('http://localhost:3000/profile'); // Đảm bảo URL này là chính xác
        } else {
            res.redirect('http://localhost:3000/login'); // Redirect về login nếu không có user
        }
    }
);

export default router;
