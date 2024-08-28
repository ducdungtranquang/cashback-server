import { Router } from 'express';
import { registerUser, authUser } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', authUser);

export default router;
