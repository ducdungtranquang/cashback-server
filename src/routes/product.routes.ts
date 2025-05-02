import { Router } from "express";
import { 
  getAllProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reindexAllProducts
} from "../controllers/product.controller";
import { protect } from "../middleware/auth";

const router = Router();

// Public routes (authentication optional)
router.get("/", protect, getAllProducts);
router.get("/:id", protect, getProductById);

// Admin routes (authentication required)
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/reindex", protect, reindexAllProducts);

export default router;