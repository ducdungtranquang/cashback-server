import { Schema, model } from "mongoose";

const WithdrawRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    isVerify: {type: Boolean, default: false},
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const WithdrawRequest = model("WithdrawRequest", WithdrawRequestSchema);
