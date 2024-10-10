import { Router } from "express";
import passport from "passport";
import {
  registerUser,
  authUser,
  verifyToken,
  logout,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/logout", logout);
router.post("/verify-token", verifyToken);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as any;

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
    } else {
      res.redirect("http://localhost:3000/login");
    }
  }
);

export default router;
