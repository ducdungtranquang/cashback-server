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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(" ")[1];
            // Giải mã token để lấy id người dùng
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Lấy thông tin người dùng từ database và gán vào req.user
            req.user = (yield user_model_1.default.findById(decoded.id).select("-password"));
            next(); // Chuyển sang middleware hoặc route handler tiếp theo
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
});
exports.protect = protect;
