import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  checkStatusTree,
  harvestTree,
  plantTree,
  waterTree,
} from "../controllers/tree.controller";

const router = Router();

router.post("/plant", protect, plantTree);
router.post("/water", protect, waterTree);
router.get("/", protect, checkStatusTree);
router.post("/harvest-tree", protect, harvestTree);

export default router;
