import { Router } from "express";
import passport from "passport";
import {
  registerUser,
  authUser,
  verifyToken,
  logout,
  verifyEmailToken,
  resendVerificationCode,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/logout", logout);
router.post("/verify-token", protect, verifyToken);
router.post("/verify-account", verifyEmailToken);
router.post("/resend-verify", resendVerificationCode);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
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

      // Populate data to chat app
      const data = {
        username: user.email,
        password: "12345678",
        email: user.email,
        isAvatarImageSet: true,
        avatarImage: `https://api.multiavatar.com/${Math.round(
          Math.random() * 1000
        )}`,
      };

      try {
        await fetch("http://localhost:5001/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.log("error", error);
      }

      res.redirect("http://localhost:3000/profile");
    } else {
      res.redirect("http://localhost:3000/login");
    }
  }
);

export default router;
