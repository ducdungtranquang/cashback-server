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
exports.getCart = exports.removeFromCart = exports.updateCartQuantity = exports.addToCart = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productName, price, productLink, cashbackPercentage, quantity, productId, } = req.body;
        if (!productName ||
            !price ||
            !productLink ||
            !cashbackPercentage ||
            !quantity ||
            !productId) {
            return res
                .status(400)
                .json({ message: "Please provide all required fields." });
        }
        const existingCartItem = yield cart_model_1.default.findOne({
            userId: (req === null || req === void 0 ? void 0 : req.user)._id,
            productName,
            productLink,
        });
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            yield existingCartItem.save();
            return res.status(200).json({
                message: "Product quantity updated successfully.",
                cartItem: existingCartItem,
            });
        }
        else {
            const newCartItem = yield cart_model_1.default.create({
                userId: (req === null || req === void 0 ? void 0 : req.user)._id,
                productName,
                price,
                productLink,
                cashbackPercentage,
                quantity,
                productId,
            });
            return res.status(201).json({
                message: "Product added to cart successfully.",
                cartItem: newCartItem,
            });
        }
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.addToCart = addToCart;
const updateCartQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, newQuantity } = req.body;
        if (!productId || !newQuantity) {
            return res
                .status(400)
                .json({ message: "Please provide product ID and new quantity." });
        }
        const cartItem = yield cart_model_1.default.findOne({
            userId: (req === null || req === void 0 ? void 0 : req.user)._id,
            _id: productId,
        });
        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart." });
        }
        cartItem.quantity = newQuantity;
        yield cartItem.save();
        res
            .status(200)
            .json({ message: "Product quantity updated successfully.", cartItem });
    }
    catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.updateCartQuantity = updateCartQuantity;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productIds } = req.body;
        if (!productIds || !productIds.length) {
            return res.status(400).json({ message: "No product IDs provided." });
        }
        yield cart_model_1.default.deleteMany({
            userId: (req === null || req === void 0 ? void 0 : req.user)._id,
            _id: { $in: productIds },
        });
        res
            .status(200)
            .json({ message: "Products removed from cart successfully." });
    }
    catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.removeFromCart = removeFromCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const total = yield cart_model_1.default.countDocuments({ userId: (req === null || req === void 0 ? void 0 : req.user)._id });
        const cartItems = yield cart_model_1.default.find({ userId: (req === null || req === void 0 ? void 0 : req.user)._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);
        res.json({
            page,
            pages: Math.ceil(total / limit),
            total,
            cartItems,
        });
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.getCart = getCart;
