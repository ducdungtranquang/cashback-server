import { Request, Response } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "../ultils/sendEmail";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as any)._id).select(
      "-password -verificationRequestsCount -lastVerificationRequest"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.accountBank = req.body.accountBank || user.accountBank;
    user.bankName = req.body.bankName || user.bankName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.inviteCode = req.body.inviteCode || user.inviteCode;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      accountBank: updatedUser.accountBank,
      bankName: updatedUser.bankName,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      city: updatedUser.city,
      message: "User profile updated successfully",
      inviteCode: updatedUser.inviteCode,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentPassword === newPassword) {
      return res.status(401).json({ message: "Incorrect new password" });
    }

    const isMatch = await user.comparePassword!(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid token or user not found" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
