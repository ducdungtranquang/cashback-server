"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchaseHistory_controller_1 = require("../controllers/purchaseHistory.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/save', auth_1.protect, purchaseHistory_controller_1.savePurchaseHistory);
router.get('/', auth_1.protect, purchaseHistory_controller_1.getPurchaseHistory);
exports.default = router;
