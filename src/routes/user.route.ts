import { Router } from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  forgotPassword,
  getAllUserProfile,
  getUserProfile,
  resetPassword,
  updateUser,
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
router.post("/admin-create-users", protect, createUser);
router.put("/admin-update-users/:userId", protect, updateUser);
router.delete("/admin-del-users/:userId", protect, deleteUser);
router.get("/admin-all-user", protect, getAllUserProfile);

export default router;
