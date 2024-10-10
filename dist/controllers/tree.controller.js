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
exports.harvestTree = exports.checkStatusTree = exports.waterTree = exports.plantTree = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const plantTree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { treeType } = req.body;
    try {
        const user = yield user_model_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hasLivingTree = user.trees.some((tree) => tree.status === "alive");
        if (hasLivingTree) {
            return res.status(400).json({
                message: "You already have a tree planted. Please harvest or wait for it to die before planting a new one.",
            });
        }
        if (!["Sunflower", "Cactus", "Lotus", "Mushroom"].includes(treeType)) {
            return res.status(400).json({ message: "Invalid tree type" });
        }
        user === null || user === void 0 ? void 0 : user.trees.push({
            type: treeType,
            plantedAt: new Date(),
            lastWateredAt: new Date(),
            waterings: 0,
            status: "alive",
        });
        yield user.save();
        res.json({
            message: `${treeType} planted successfully!`,
            data: user === null || user === void 0 ? void 0 : user.trees,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Server error, please try again later." });
    }
});
exports.plantTree = plantTree;
const waterTree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { treeId, payForExtraWatering } = req.body;
    try {
        const user = yield user_model_1.default.findById(req.user._id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const tree = user.trees.id(treeId);
        if (!tree || tree.status === "dead") {
            return res.status(400).json({ message: "Invalid or dead tree" });
        }
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now.getTime() - tree.lastWateredAt.getTime() < oneDay &&
            !payForExtraWatering) {
            return res
                .status(400)
                .json({ message: "You can only water the tree once a day for free." });
        }
        if (payForExtraWatering) {
            if (user.money < 100)
                return res.status(200).json({
                    status: false,
                    message: "Not enough funds to water more than once per day.",
                });
            user.money -= 100;
        }
        tree.waterings += 1;
        tree.lastWateredAt = now;
        if (tree.waterings >= 7) {
            user.money += 150;
            tree.status = "dead";
        }
        yield user.save();
        res.json({
            status: true,
            message: "Tree watered successfully!",
        });
    }
    catch (error) {
        console.log(error, "Error");
    }
});
exports.waterTree = waterTree;
const checkStatusTree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.trees || user.trees.length === 0) {
            return res.status(404).json({ message: "No trees found for this user." });
        }
        const tree = user.trees[user.trees.length - 1];
        const userCoin = user.money;
        const daysSinceLastWatering = Math.floor((Date.now() - new Date(tree.lastWateredAt).getTime()) /
            (1000 * 60 * 60 * 24));
        if (daysSinceLastWatering >= 3) {
            tree.status = "dead";
            yield user.save();
            return res.json({
                message: "Your tree has died. Please plant a new tree.",
            });
        }
        res.json({
            userCoin,
            tree,
            message: `Your tree has been watered ${tree.waterings} times. Water it ${7 - tree.waterings} more times to harvest.`,
        });
    }
    catch (error) {
        console.error("Error checking tree status:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.checkStatusTree = checkStatusTree;
const harvestTree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.trees || user.trees.length === 0) {
            return res.status(404).json({ message: "No tree found to harvest." });
        }
        const tree = user.trees[user.trees.length - 1];
        if (tree.waterings < 7) {
            return res.status(400).json({
                message: "Your tree is not ready to harvest yet. You need to water it more.",
            });
        }
        user.money += 150;
        user.moneyByEvent.tree += 150;
        tree.status = "finish";
        yield user.save();
        res.json({
            message: "You have successfully harvested the tree and received 150Đ.",
        });
    }
    catch (error) {
        console.error("Error harvesting tree:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
exports.harvestTree = harvestTree;
