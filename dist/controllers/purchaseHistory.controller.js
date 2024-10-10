"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchaseHistory = exports.savePurchaseHistory = void 0;
const purchaseHistory_model_1 = __importDefault(require("../models/purchaseHistory.model"));
const savePurchaseHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productName, price, productLink, cashbackPercentage, quantity } = req.body;
        if (!productName || !price || !productLink || !cashbackPercentage || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const purchaseHistory = yield purchaseHistory_model_1.default.create({
            userId: (req === null || req === void 0 ? void 0 : req.user)._id,
            productName,
            price,
            productLink,
            cashbackPercentage,
            quantity,
        });
        res.status(201).json(purchaseHistory);
    }
    catch (error) {
        console.error('Error saving purchase history:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});
exports.savePurchaseHistory = savePurchaseHistory;
const getPurchaseHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const total = yield purchaseHistory_model_1.default.countDocuments({ userId: (req === null || req === void 0 ? void 0 : req.user)._id });
        const purchaseHistory = yield purchaseHistory_model_1.default.find({ userId: (req === null || req === void 0 ? void 0 : req.user)._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);
        res.json({
            page,
            pages: Math.ceil(total / limit),
            total,
            purchaseHistory,
        });
    }
    catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});
exports.getPurchaseHistory = getPurchaseHistory;
