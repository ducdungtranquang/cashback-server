import { Request, Response } from "express";
import User from "../models/user.model";
import { WithdrawRequest } from "../models/withdrawRequest";
import { getRandomInt } from "../ultils/func";
import { sendEmailWithdrawRequest } from "../ultils/sendEmail";

export const requestWithdraw = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.money < 50000)
      return res
        .status(400)
        .json({ message: "Số dư không đủ để thực hiện yêu cầu rút tiền" });

    const verificationCode = getRandomInt(1000000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await WithdrawRequest.create({
      userId: user._id,
      amount,
      verificationCode,
      expiresAt,
    });

    await sendEmailWithdrawRequest(user.email, verificationCode);

    res.json({ message: "Đã gửi mã xác thực qua email" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};

export const verifyWithdraw = async (req: Request, res: Response) => {
  const { userId, verificationCode } = req.body;

  try {
    const request = await WithdrawRequest.findOne({
      userId,
      verificationCode,
      status: "pending",
    });

    if (!request)
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });

    if (new Date() > request.expiresAt)
      return res.status(400).json({ message: "Mã xác thực đã hết hạn" });

    request.status = "approved";
    await request.save();

    res.json({ message: "Xác thực thành công, yêu cầu đang chờ duyệt" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};
