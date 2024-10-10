"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.registerUser);
router.post("/login", auth_controller_1.authUser);
router.post("/logout", auth_controller_1.logout);
router.post("/verify-token", auth_controller_1.verifyToken);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const user = req.user;
    if (user) {
        res.cookie("authToken", user.token, {
            path: "/",
        });
        res.cookie("email", user.email, {
            path: "/",
        });
        res.cookie("id", user._id, {
            path: "/",
        });
        res.cookie("user_name", user.name, {
            path: "/",
        });
        res.redirect("http://localhost:3000/profile");
    }
    else {
        res.redirect("http://localhost:3000/login");
    }
});
exports.default = router;
