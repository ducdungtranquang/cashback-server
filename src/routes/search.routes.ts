import { Router } from "express";
import { 
  searchProducts, 
  searchShops, 
  getSuggestions, 
  getSearchHistory, 
  clearSearchHistory 
} from "../controllers/search.controller";
import { protect } from "../middleware/auth";

const router = Router();

// Public routes (authentication optional)
router.get("/products", protect, searchProducts);
router.get("/shops", protect, searchShops);
router.get("/suggestions", protect, getSuggestions);

// Protected routes (authentication required)
router.get("/history", protect, getSearchHistory);
router.delete("/history", protect, clearSearchHistory);

export default router;