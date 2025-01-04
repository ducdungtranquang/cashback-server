import { Router } from 'express';
import { fetchAndSaveDataAffiliate, getPurchaseHistory, savePurchaseHistory } from '../controllers/purchaseHistory.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/save', protect, savePurchaseHistory);
router.get('/', protect, getPurchaseHistory);
router.post('/admin', protect, fetchAndSaveDataAffiliate);

export default router;
