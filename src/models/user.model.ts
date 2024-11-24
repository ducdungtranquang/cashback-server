import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ITree, TreeSchema } from "./tree.model";

export interface IUser extends Document {
  name: string;
  email: string;
  age?:number;
  password?: string;
  accountBank?: string;
  bankName?: string;
  googleId?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  inviteCode?: string[];
  money: number;
  trees?: ITree[];
  freeSpins?: number;
  lastSpinDate?: Date;
  spinToken?: string;
  spinStartTime?: Date;
  secretBoxesCollected?: number;
  isVerified?: boolean;
  verificationRequestsCount?:number;
  lastVerificationRequest?: Date;
  moneyByEvent: {   
    tree: number;
    wheel: number;
  };
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    accountBank: { type: String },
    bankName: { type: String },
    googleId: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    city: { type: String },
    age: { type: Number },
    inviteCode: { type: String },
    money: { type: Number, default: 0 },
    trees: [TreeSchema],
    freeSpins: { type: Number, default: 1 },
    lastSpinDate: { type: Date },
    spinToken: { type: String, default: null },
    spinStartTime: { type: Date },
    secretBoxesCollected: { type: Number, default: 0 },
    moneyByEvent: {
      tree: { type: Number, default: 0 },
      wheel: { type: Number, default: 0 },
    },
    isVerified: { type: Boolean, default: false },
    verificationRequestsCount: {
      type: Number,
      default: 0,
    },
    lastVerificationRequest: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password!);
};

export default mongoose.model<IUser>("User", UserSchema);
