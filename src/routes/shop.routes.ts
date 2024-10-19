import express from "express";
import { getShops } from "../controllers/prouduct.controller";

const router = express.Router();

router.get("/", getShops);

export default router;
