import express from "express";
import { getShops } from "../controllers/product.controller-v0";

const router = express.Router();

router.get("/", getShops);

export default router;
