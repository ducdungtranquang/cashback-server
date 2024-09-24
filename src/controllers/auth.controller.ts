import { Request, Response } from "express";
import User from "../models/user.model";
import generateToken from "../ultils/generateToken";
import jwt from "jsonwebtoken";
import BlacklistToken from "../models/blackList";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return res.status(200).json({ valid: true, user: decoded });
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

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
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
        token: generateToken(user._id as string),
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
