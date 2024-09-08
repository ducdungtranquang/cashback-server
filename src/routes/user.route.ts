import { Router } from 'express';
import { changePassword, forgotPassword, resetPassword, updateUserProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
