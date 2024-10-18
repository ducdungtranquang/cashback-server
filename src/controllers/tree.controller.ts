import { Request, Response } from "express";
import User from "../models/user.model";

export const plantTree = async (req: Request, res: Response) => {
  const { treeType } = req.body;

  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasLivingTree = (user as any).trees.some(
      (tree: any) => tree.status === "alive"
    );

    if (hasLivingTree) {
      return res.status(400).json({
        message:
          "You already have a tree planted. Please harvest or wait for it to die before planting a new one.",
      });
    }

    if (!["Sunflower", "Cactus", "Lotus", "Mushroom"].includes(treeType)) {
      return res.status(400).json({ message: "Invalid tree type" });
    }

    (user as any)?.trees.push({
      type: treeType,
      plantedAt: new Date(),
      lastWateredAt: new Date(),
      waterings: 0,
      status: "alive",
    });

    await user.save();
    res.json({
      message: `${treeType} planted successfully!`,
      data: (user as any)?.trees,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

export const waterTree = async (req: Request, res: Response) => {
  const { treeId, payForExtraWatering } = req.body;

  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const tree = (user as any).trees.id(treeId);

    if (!tree || tree.status === "dead") {
      return res.status(400).json({ message: "Invalid or dead tree" });
    }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (
      now.getTime() - tree.lastWateredAt.getTime() < oneDay &&
      !payForExtraWatering &&
      tree.waterings > 0
    ) {
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

    await user.save();
    res.json({
      status: true,
      message: "Tree watered successfully!",
    });
  } catch (error) {
    console.log(error, "Error");
  }
};

export const checkStatusTree = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const user = await User.findById(userId);

    if (!user || !user.trees || user.trees.length === 0) {
      return res.status(404).json({ message: "No trees found for this user." });
    }

    const tree = user.trees[user.trees.length - 1];
    const userCoin = user.money;

    const daysSinceLastWatering = Math.floor(
      (Date.now() - new Date(tree.lastWateredAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastWatering >= 3) {
      tree.status = "dead";
      await user.save();
      return res.json({
        message: "Your tree has died. Please plant a new tree.",
      });
    }

    res.json({
      userCoin,
      tree,
      message: `Your tree has been watered ${tree.waterings} times. Water it ${
        7 - tree.waterings
      } more times to harvest.`,
    });
  } catch (error) {
    console.error("Error checking tree status:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const harvestTree = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const user = await User.findById(userId);

    if (!user || !user.trees || user.trees.length === 0) {
      return res.status(404).json({ message: "No tree found to harvest." });
    }

    const tree = user.trees[user.trees.length - 1];

    if (tree.waterings < 7) {
      return res.status(400).json({
        message:
          "Your tree is not ready to harvest yet. You need to water it more.",
      });
    }

    user.money += 150;
    user.moneyByEvent!.tree += 150;
    tree.status = "finish";

    await user.save();

    res.json({
      message: "You have successfully harvested the tree and received 150Đ.",
    });
  } catch (error) {
    console.error("Error harvesting tree:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
