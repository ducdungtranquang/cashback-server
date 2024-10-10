import express from 'express';
import { getProducts } from '../controllers/prouduct.controller';

const router = express.Router();

router.get('/', getProducts);

export default router;
