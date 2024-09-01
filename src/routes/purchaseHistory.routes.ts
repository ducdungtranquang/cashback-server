import { Router } from 'express';
import { savePurchaseHistory } from '../controllers/purchaseHistory.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/save', protect, savePurchaseHistory);

export default router;
