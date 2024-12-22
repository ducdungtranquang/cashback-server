import express from "express";
import { getCounts, getProductById, getProducts } from "../controllers/prouduct.controller";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", getProducts);
router.get("/admin-product",protect, getCounts);
router.get("/:id", getProductById);

export default router;
