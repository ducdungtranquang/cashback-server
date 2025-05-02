import { Router } from "express";
import { 
  getAllShops, 
  getShopById,
  createShop,
  updateShop,
  deleteShop,
  getShopCategories,
  getShopPlatforms,
  reindexAllShops
} from "../controllers/shop.controller";
import { protect } from "../middleware/auth";

const router = Router();

// Public routes (authentication optional)
router.get("/", protect, getAllShops);
router.get("/categories", getShopCategories);
router.get("/platforms", getShopPlatforms);
router.get("/:id", protect, getShopById);

// Admin routes (authentication required)
router.post("/", protect, createShop);
router.put("/:id", protect, updateShop);
router.delete("/:id", protect, deleteShop);
router.post("/reindex", protect, reindexAllShops);

export default router;