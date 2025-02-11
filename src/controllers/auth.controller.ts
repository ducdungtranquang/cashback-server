import { Request, Response } from "express";
import User from "../models/user.model";
import generateToken from "../ultils/generateToken";
import jwt from "jsonwebtoken";
import BlacklistToken from "../models/blackList.model";
import validator from "validator";
import {
  sendEmailWithdrawRequest,
  sendVerificationEmail,
} from "../ultils/sendEmail";
import { getRandomInt } from "../ultils/func";

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

    const verificationCode = getRandomInt(1000000).toString();
    const now = new Date();

    const user = await User.create({
      email,
      password,
      name,
      accountBank,
      isVerified: false,
      verificationCode: verificationCode,
      verificationExpires: new Date(Date.now() + 15 * 60 * 1000),
      lastVerificationRequestAccount: now,
    });

    if (user) {
      await sendEmailWithdrawRequest(
        user.email,
        `Mã xác thực của bạn là: ${verificationCode}`
      );

      console.log("verificationCode", verificationCode);
      res.status(201).json({
        success: true,
        message:
          "User registered. Please check your email for the verification code.",
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
        const verificationCode = getRandomInt(1000000).toString();
        const now = new Date();

        const lastRequest = user.lastVerificationRequest
          ? new Date(user.lastVerificationRequest)
          : new Date(0);

        if (now.getTime() - lastRequest.getTime() < 60 * 1000) {
          return res
            .status(429)
            .json({
              message: "Vui lòng chờ 1 phút trước khi gửi lại.",
              status: "pending",
              isVerified: false,
            });
        }

        user.verificationCode = verificationCode;
        user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        (user.lastVerificationRequestAccount = now), await user.save();

        return res.status(401).json({
          message: "Xác thực email của bạn trước",
          isVerified: false,
          status: "sent",
        });
      }

      res.json({
        _id: user._id,
        email: user.email,
        name: user.name,
        isVerified: true,
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
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.verificationCode) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Verification code has expired." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      accountBank: user.accountBank,
      isVerified: true,
      token: generateToken(user._id as string),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res
        .status(400)
        .json({ message: "Tài khoản không hợp lệ hoặc đã xác minh." });
    }

    const now = new Date();
    const lastRequest = user.lastVerificationRequest
      ? new Date(user.lastVerificationRequest)
      : new Date(0);

    if (now.getTime() - lastRequest.getTime() < 60 * 1000) {
      return res
        .status(429)
        .json({ message: "Vui lòng chờ 1 phút trước khi gửi lại." });
    }

    user.verificationCode = getRandomInt(1000000).toString();
    user.verificationExpires = new Date(now.getTime() + 15 * 60 * 1000);
    user.lastVerificationRequest = now;
    await user.save();

    await sendEmailWithdrawRequest(
      email,
      `Mã xác thực của bạn là: ${user.verificationCode}`
    );

    res.status(200).json({ message: "Mã xác thực đã được gửi lại." });
  } catch (error) {
    console.error("Lỗi gửi lại mã xác thực:", error);
    res.status(500).json({ message: "Lỗi máy chủ, thử lại sau." });
  }
};
