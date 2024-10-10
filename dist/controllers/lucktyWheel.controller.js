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
exports.claimPrize = exports.startSpin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const startSpin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const today = new Date().toISOString().split("T")[0];
        const lastSpinDate = user.lastSpinDate
            ? user.lastSpinDate.toISOString().split("T")[0]
            : null;
        if (lastSpinDate === today && user.freeSpins <= 0) {
            if (user.money < 100) {
                return res
                    .status(400)
                    .json({ message: "You don't have enough money to spin again." });
            }
            user.money -= 100;
        }
        else if (lastSpinDate !== today) {
            user.freeSpins = 1;
        }
        const spinToken = crypto_1.default.randomBytes(16).toString("hex");
        user.spinToken = spinToken;
        user.spinStartTime = new Date();
        user.lastSpinDate = new Date();
        yield user.save();
        res.json({
            message: "Spin started! You have 10 seconds to claim your prize.",
            spinToken,
            expiresIn: 10,
        });
    }
    catch (error) {
        console.error("Error starting spin:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.startSpin = startSpin;
const claimPrize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spinToken, prize } = req.body;
    try {
        const userId = req.user._id;
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.spinToken || !user.spinStartTime) {
            return res.status(400).json({ message: "No active spin found." });
        }
        if (user.spinToken !== spinToken) {
            user.money -= 100;
            yield user.save();
            return res.status(400).json({ message: "Invalid spin token." });
        }
        const currentTime = new Date().getTime();
        const spinStartTime = new Date(user.spinStartTime).getTime();
        const timeElapsed = (currentTime - spinStartTime) / 1000;
        if (timeElapsed > 10) {
            return res.status(400).json({
                message: "Time expired! You didn't claim your prize in time.",
            });
        }
        if (prize === "Secret Box") {
            user.secretBoxesCollected += 1;
        }
        if (user.secretBoxesCollected >= 3) {
            const bonus = Math.floor(Math.random() * 201) + 100;
            user.money += bonus;
            user.secretBoxesCollected = 0;
        }
        user.spinToken = "";
        // user.spinStartTime = 0;
        user.money += prize === "Secret Box" ? 0 : prize === "Money" ? 100 : 0;
        yield user.save();
        res.json({
            message: `Successfull!`,
        });
    }
    catch (error) {
        console.error("Error claiming prize:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.claimPrize = claimPrize;
