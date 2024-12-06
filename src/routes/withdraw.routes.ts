import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createWithdraw,
  getWithdrawHistory,
} from "../controllers/withdrawHistory.controller";
import {
  requestWithdraw,
  verifyWithdraw,
} from "../controllers/withdrawRequest.controller";

const router = Router();

router.post("/save", protect, createWithdraw);
router.post("/request", protect, requestWithdraw);
router.post("/verify-withdraw", protect, verifyWithdraw);
router.get("/", protect, getWithdrawHistory);

export default router;
