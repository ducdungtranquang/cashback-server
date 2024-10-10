"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const withdrawHistory_controller_1 = require("../controllers/withdrawHistory.controller");
const router = (0, express_1.Router)();
router.post("/save", auth_1.protect, withdrawHistory_controller_1.createWithdraw);
router.get("/", auth_1.protect, withdrawHistory_controller_1.getWithdrawHistory);
exports.default = router;
