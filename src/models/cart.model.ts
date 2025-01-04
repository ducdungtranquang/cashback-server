import { Schema, model, Document } from "mongoose";

interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  productName: string;
  price: string;
  productLink: string;
  cashbackPercentage: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
  productId: string;
  productImg?: string;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    productLink: {
      type: String,
      required: true,
    },
    productImg: {
      type: String,
    },
    cashbackPercentage: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = model<ICart>("Cart", CartSchema);

export default Cart;
