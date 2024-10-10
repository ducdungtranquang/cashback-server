import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getUserProfile,
  resetPassword,
  updateUserProfile,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth";
import { claimPrize, startSpin } from "../controllers/lucktyWheel.controller";

const router = Router();

router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.get("/", protect, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/spin", protect, startSpin);
router.post("/prize", protect, claimPrize);

export default router;
