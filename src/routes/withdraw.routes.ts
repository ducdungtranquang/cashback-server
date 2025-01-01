import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createWithdraw,
  getAllWithdrawHistory,
  getWithdrawHistory,
} from "../controllers/withdrawHistory.controller";
import {
  approveWithdrawRequest,
  getAllWithdrawRequests,
  requestWithdraw,
  verifyWithdraw,
} from "../controllers/withdrawRequest.controller";

const router = Router();

router.post("/save", protect, createWithdraw);
router.post("/request", protect, requestWithdraw);
router.get("/admin-all-request", protect, getAllWithdrawRequests);
router.put("/admin-approve-request/:id", protect, approveWithdrawRequest);
router.get("/admin-all-withdraw-history", protect, getAllWithdrawHistory);
router.post("/verify-withdraw", protect, verifyWithdraw);
router.get("/", protect, getWithdrawHistory);

export default router;
