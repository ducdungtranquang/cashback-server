"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BlacklistTokenSchema = new mongoose_1.default.Schema({
    token: { type: String, required: true, unique: true },
    expirationDate: { type: Date, required: true },
});
const BlacklistToken = mongoose_1.default.model("BlacklistToken", BlacklistTokenSchema);
exports.default = BlacklistToken;
