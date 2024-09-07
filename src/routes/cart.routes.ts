import { Router } from 'express';
import { addToCart, getCart, removeFromCart, updateCartQuantity } from '../controllers/cart.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/add', protect, addToCart);
router.delete('/remove', protect, removeFromCart);
router.put('/update-quantity', protect, updateCartQuantity);
router.get('/', protect, getCart);

export default router;
