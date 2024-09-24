import { timeStamp } from "console";
import { Schema, model, Document } from "mongoose";

interface IWithdrawHistory extends Document {
  userId: Schema.Types.ObjectId;
  bank: string;
  money: number;
  accountBank: number;
  withdrawDate: Date;
}

const WithdrawHistorySchema = new Schema<IWithdrawHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    money: {
      type: Number,
      required: true,
    },
    accountBank: {
      type: Number,
      required: true,
    },
    withdrawDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PurchaseHistory = model<IWithdrawHistory>(
  "PurchaseHistory",
  WithdrawHistorySchema
);

export default PurchaseHistory;
