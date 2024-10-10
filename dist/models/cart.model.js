"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    productLink: {
        type: String,
        required: true,
    },
    cashbackPercentage: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
const Cart = (0, mongoose_1.model)("Cart", CartSchema);
exports.default = Cart;
