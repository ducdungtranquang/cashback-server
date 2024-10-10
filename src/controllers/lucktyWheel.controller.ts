import crypto from "crypto";
import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";

export const startSpin = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const user: IUser | null = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    const lastSpinDate = (user as IUser).lastSpinDate
      ? user.lastSpinDate!.toISOString().split("T")[0]
      : null;

    if (lastSpinDate === today && user.freeSpins! <= 0) {
      if (user.money < 100) {
        return res
          .status(400)
          .json({ message: "You don't have enough money to spin again." });
      }
      user.money -= 100;
    } else if (lastSpinDate !== today) {
      user.freeSpins = 1;
    }

    const spinToken = crypto.randomBytes(16).toString("hex");

    user.spinToken = spinToken;
    user.spinStartTime = new Date();
    user.lastSpinDate = new Date();

    await user.save();

    res.json({
      message: "Spin started! You have 10 seconds to claim your prize.",
      spinToken,
      expiresIn: 10,
    });
  } catch (error) {
    console.error("Error starting spin:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const claimPrize = async (req: Request, res: Response) => {
  const { spinToken, prize } = req.body;

  try {
    const userId = (req.user as any)._id;
    const user: IUser | null = await User.findById(userId);

    if (!user || !user.spinToken || !user.spinStartTime) {
      return res.status(400).json({ message: "No active spin found." });
    }

    if (user.spinToken !== spinToken) {
      user.money -= 100;
      await user.save();
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
      user.secretBoxesCollected! += 1;
    }

    if (user.secretBoxesCollected! >= 3) {
      const bonus = Math.floor(Math.random() * 201) + 100;
      user.money += bonus;
      user.secretBoxesCollected! = 0;
    }

    user.spinToken = "";
    // user.spinStartTime = 0;
    user.money += prize === "Secret Box" ? 0 : prize === "Money" ? 100 : 0;

    await user.save();

    res.json({
      message: `Successfull!`,
    });
  } catch (error) {
    console.error("Error claiming prize:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
