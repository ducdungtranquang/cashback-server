"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PurchaseHistorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productName: {
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
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
});
const PurchaseHistory = (0, mongoose_1.model)('PurchaseHistory', PurchaseHistorySchema);
exports.default = PurchaseHistory;
