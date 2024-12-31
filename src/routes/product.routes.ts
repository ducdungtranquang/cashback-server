import express from "express";
import {
  addProduct,
  deleteProduct,
  getCounts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", getProducts);
router.get("/admin-product", protect, getCounts);
router.post("/admin-add-product", protect, addProduct);
router.put("/admin-edit-product/:id", protect, updateProduct);
router.delete("/admin-del-product/:id", protect, deleteProduct);
router.get("/:id", getProductById);

export default router;
