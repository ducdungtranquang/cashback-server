import { Request, Response } from "express";
import User from "../models/user.model";
import generateToken from "../ultils/generateToken";
import jwt from "jsonwebtoken";
import BlacklistToken from "../models/blackList.model";
import validator from "validator";
import { sendVerificationEmail } from "../ultils/sendEmail";

export const verifyToken = async (req: Request, res: Response) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ valid: false, message: "Token is required" });
  }

  try {
    const blacklistedToken = await BlacklistToken.findOne({ token });

    if (blacklistedToken) {
      return res.status(401).json({ message: "Token is revoked" });
    }

    const role = (req.user as any)?.role;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return res.status(200).json({ valid: true, user: decoded, role });
  } catch (error) {
    return res
      .status(401)
      .json({ valid: false, message: "Invalid or expired token" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, accountBank } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Please provide all required fields: email, password, name.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      password,
      name,
      accountBank,
      isVerified: false,
    });

    if (user) {
      const verificationToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        success: true,
        message: "User registered. Please verify your email to log in.",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const authUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword!(password))) {
      if (!user.isVerified) {
        return res
          .status(401)
          .json({ message: "Please verify your email first." });
      }

      res.json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id as string),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token required" });
  }

  try {
    const decoded: any = jwt.decode(token);

    const expirationDate = new Date(decoded.exp * 1000);

    await BlacklistToken.create({
      token,
      expirationDate,
    });

    res.status(200).json({ success: true, message: "Token revoked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error revoking token" });
  }
};

export const verifyEmailToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  try {
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid verification token." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already registered" });
    }

    user.isVerified = true;
    await user.save();

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

    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      accountBank: user.accountBank,
      token: generateToken(user._id as string),
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const isSameDay =
      user.lastVerificationRequest &&
      now.toDateString() ===
        new Date(user.lastVerificationRequest).toDateString();

    if (isSameDay && user?.verificationRequestsCount! >= 2) {
      return res
        .status(429)
        .json({ message: "Daily limit reached for verification emails." });
    }

    if (!isSameDay) {
      user.verificationRequestsCount = 0;
    }

    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    await sendVerificationEmail(email, verificationToken);

    user.verificationRequestsCount! += 1;
    user.lastVerificationRequest = now;
    await user.save();

    res.status(200).json({ message: "Verification code resent successfully." });
  } catch (error) {
    console.error("Error resending verification code:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
