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

export const getAllWithdrawRequests = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findById((req.user as any)._id).select(
      "role"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.role === 0) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { search } = req.query;

    let filter: any = {};
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { bankAccount: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((user) => user._id);
      filter.userId = { $in: userIds };
    }

    const withdrawRequests = await WithdrawRequest.find(filter)
      .populate("userId", "name email phone bankAccount")
      .sort({ createdAt: -1 });

    res.status(200).json(withdrawRequests);
  } catch (error) {
    console.error("Error getting withdraw requests:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const approveWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const currentUser = await User.findById((req.user as any)._id).select(
      "role"
    );
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.role === 0) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const withdrawRequest = await WithdrawRequest.findById(requestId);
    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }

    if (withdrawRequest.status !== "pending") {
      return res.status(400).json({
        message: `Cannot update withdraw request with status "${withdrawRequest.status}"`,
      });
    }

    withdrawRequest.status = status;
    await withdrawRequest.save();

    res.status(200).json({
      message: `Withdraw request has been ${status} successfully`,
      withdrawRequest,
    });
  } catch (error) {
    console.error("Error approving withdraw request:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
