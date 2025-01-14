import { Request, Response } from "express";
import User from "../models/user.model";
import { WithdrawRequest } from "../models/withdrawRequest";
import WithdrawHistory from "../models/withdrawHistory.model";
import { getRandomInt } from "../ultils/func";
import { sendEmailWithdrawRequest } from "../ultils/sendEmail";

export const requestWithdraw = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.money < 50000) {
      return res
        .status(400)
        .json({ message: "Số dư không đủ để thực hiện yêu cầu rút tiền" });
    }

    if (user.money < Number(amount)) {
      return res.status(400).json({ message: "Yêu cầu không hợp lệ" });
    }

    const verificationCode = getRandomInt(1000000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await WithdrawRequest.create({
      userId: user._id,
      amount,
      verificationCode,
      expiresAt,
      status: "pending",
      isVerify: false,
    });

    await sendEmailWithdrawRequest(
      user.email,
      `Mã xác thực của bạn là: ${verificationCode}`
    );

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
    });

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });

    if (!request)
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });

    if (new Date() > request.expiresAt)
      return res.status(400).json({ message: "Mã xác thực đã hết hạn" });

    request.isVerify = true;
    await request.save();
    await User.updateOne(
      { _id: userId },
      { money: Number(user.money) - Number(request.amount) }
    );

    res.json({
      message: "Xác thực thành công, yêu cầu đang chờ duyệt",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};

export const getAllWithdrawRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user as any).role <= 0) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    const { search } = req.query;

    let filter: any = { isVerify: true };
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
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user || (req.user as any).role <= 0) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    const currentUser = await User.findById((req.user as any)._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const withdrawRequest = await WithdrawRequest.findById(id);
    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }

    if (!withdrawRequest.isVerify) {
      return res.status(400).json({
        message: `Cannot update withdraw request"`,
      });
    }

    if (withdrawRequest.status !== "pending") {
      return res.status(400).json({
        message: `Cannot update withdraw request with status "${withdrawRequest.status}"`,
      });
    }

    withdrawRequest.status = status;
    await withdrawRequest.save();

    if (status === "rejected") {
      currentUser.money = currentUser.money + withdrawRequest.amount;
      sendEmailWithdrawRequest(
        currentUser.email,
        "Yêu cầu của bạn đã bị từ chối, vui lòng liên hệ nhân viên nếu cần hỗ trợ"
      );
    }
    if (status === "approved") {
      currentUser.total += Number(withdrawRequest.amount);
      await WithdrawHistory.create({
        userId: currentUser.id,
        bank: currentUser.bankName,
        money: withdrawRequest.amount,
        accountBank: currentUser.accountBank,
        transId: withdrawRequest._id,
      });
      sendEmailWithdrawRequest(
        currentUser.email,
        `Yêu cầu của bạn đã được chấp thuận, số tiền ${withdrawRequest.amount}Đ đã được chuyển về tài khoản ngân hàng của bạn`
      );
    }

    await currentUser.save();

    res.status(200).json({
      message: `Withdraw request has been ${status} successfully`,
      withdrawRequest,
    });
  } catch (error) {
    console.error("Error approving withdraw request:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
