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
exports.logout = exports.authUser = exports.registerUser = exports.verifyToken = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const generateToken_1 = __importDefault(require("../ultils/generateToken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const blackList_model_1 = __importDefault(require("../models/blackList.model"));
const verifyToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token;
    if (!token) {
        return res.status(400).json({ valid: false, message: "Token is required" });
    }
    try {
        const blacklistedToken = yield blackList_model_1.default.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ message: "Token is revoked" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ valid: true, user: decoded });
    }
    catch (error) {
        return res
            .status(401)
            .json({ valid: false, message: "Invalid or expired token" });
    }
});
exports.verifyToken = verifyToken;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, accountBank } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Please provide all required fields: email, password, name.",
            });
        }
        const userExists = yield user_model_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = yield user_model_1.default.create({
            email,
            password,
            name,
            accountBank,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                name: user.name,
                accountBank: user.accountBank,
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.registerUser = registerUser;
const authUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Please provide both email and password." });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (user && (yield user.comparePassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }
    catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.authUser = authUser;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        const expirationDate = new Date(decoded.exp * 1000);
        yield blackList_model_1.default.create({
            token,
            expirationDate,
        });
        res.status(200).json({ success: true, message: "Token revoked" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error revoking token" });
    }
});
exports.logout = logout;
