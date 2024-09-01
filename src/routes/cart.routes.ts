import { Router } from 'express';
import { addToCart } from '../controllers/cart.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/add', protect, addToCart);

export default router;
