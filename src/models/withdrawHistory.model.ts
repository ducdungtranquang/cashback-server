import { Schema, model, Document } from "mongoose";

interface IWithdrawHistory extends Document {
  userId: Schema.Types.ObjectId;
  bank: string;
  money: number;
  accountBank: number;
  transId: string;
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
    transId: {
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

const WithdrawHistory = model<IWithdrawHistory>(
  "WithdrawHistory",
  WithdrawHistorySchema
);

export default WithdrawHistory;
