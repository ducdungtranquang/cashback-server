import { Request, Response } from "express";
import WithdrawHistory from "../models/withdrawHistory.model";

export const createWithdraw = async (req: Request, res: Response) => {
  const { bank, money, accountBank, transId } = req.body;

  try {
    if (!bank || !money || !accountBank || !transId) {
      return res.status(400).json({ message: "Missing field" });
    }

    const withdrawHistory = await WithdrawHistory.create({
      userId: req?.user as any,
      bank,
      money,
      accountBank,
      transId,
    });

    return res.status(200).json(withdrawHistory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error" });
  }
};

export const getWithdrawHistory = async (req: Request, res: Response) => {
  try {
    const withdrawHistory = await WithdrawHistory.find({
      userId: req?.user as any,
    }).sort({ withdrawDate: -1 });

    if (!withdrawHistory || withdrawHistory.length === 0) {
      return res.status(404).json({ message: "No data" });
    }

    return res.status(200).json(withdrawHistory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error" });
  }
};

export const deleteWithdrawHistory = async (req: Request, res: Response) => {
  try {
    const withdrawHistory = await WithdrawHistory.findById(req.params.id);

    if (!withdrawHistory) {
      return res.status(404).json({ message: "No data" });
    }

    if (withdrawHistory.userId.toString() !== (req?.user as any).toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await (withdrawHistory as any).remove();
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error" });
  }
};
