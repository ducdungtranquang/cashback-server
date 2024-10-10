import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createWithdraw,
  getWithdrawHistory,
} from "../controllers/withdrawHistory.controller";

const router = Router();

router.post("/save", protect, createWithdraw);
router.get("/", protect, getWithdrawHistory);

export default router;
