import { Router } from 'express';
import { getPurchaseHistory, savePurchaseHistory } from '../controllers/purchaseHistory.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/save', protect, savePurchaseHistory);
router.get('/', protect, getPurchaseHistory);

export default router;
