"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WithdrawHistorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bank: {
        type: String,
        required: true,
    },
    transId: {
        type: String,
        required: true,
    },
    money: {
        type: Number,
        required: true,
    },
    accountBank: {
        type: Number,
        required: true,
    },
    withdrawDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
const WithdrawHistory = (0, mongoose_1.model)("WithdrawHistory", WithdrawHistorySchema);
exports.default = WithdrawHistory;
