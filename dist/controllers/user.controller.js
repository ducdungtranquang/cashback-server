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
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../ultils/sendEmail");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.accountBank = req.body.accountBank || user.accountBank;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.address = req.body.address || user.address;
        user.city = req.body.city || user.city;
        user.inviteCode = req.body.inviteCode || user.inviteCode;
        const updatedUser = yield user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            accountBank: updatedUser.accountBank,
            phoneNumber: updatedUser.phoneNumber,
            address: updatedUser.address,
            city: updatedUser.city,
            message: "User profile updated successfully",
            inviteCode: updatedUser.inviteCode,
        });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.updateUserProfile = updateUserProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield user_model_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (currentPassword === newPassword) {
            return res.status(401).json({ message: "Incorrect new password" });
        }
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect current password" });
        }
        user.password = newPassword;
        yield user.save();
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.changePassword = changePassword;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }
        // Tạo token reset mật khẩu (hết hạn sau 1 giờ)
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        console.log("resetToken", resetToken);
        // Gửi email cho người dùng
        yield (0, sendEmail_1.sendResetPasswordEmail)(user.email, resetToken);
        res.status(200).json({ message: "Reset password email sent" });
    }
    catch (error) {
        console.error("Error sending reset password email:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        console.log("tokennn", token);
        // Giải mã token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Tìm người dùng dựa vào ID từ token
        const user = yield user_model_1.default.findById(decoded.id);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Invalid token or user not found" });
        }
        // Đặt lại mật khẩu
        user.password = newPassword;
        yield user.save();
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.resetPassword = resetPassword;
