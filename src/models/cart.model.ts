import { Schema, model, Document } from 'mongoose';

interface ICart extends Document {
    userId: Schema.Types.ObjectId;
    productName: string;
    price: number;
    productLink: string;
    cashbackPercentage: number;
    quantity: number;
}

const CartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    productLink: {
        type: String,
        required: true,
    },
    cashbackPercentage: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const Cart = model<ICart>('Cart', CartSchema);

export default Cart;
