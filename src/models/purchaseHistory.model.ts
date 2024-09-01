import { Schema, model, Document } from 'mongoose';

interface IPurchaseHistory extends Document {
    userId: Schema.Types.ObjectId;
    productName: string;
    price: number;
    productLink: string;
    cashbackPercentage: number;
    quantity: number;
    purchaseDate: Date;
}

const PurchaseHistorySchema = new Schema<IPurchaseHistory>({
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
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
});

const PurchaseHistory = model<IPurchaseHistory>('PurchaseHistory', PurchaseHistorySchema);

export default PurchaseHistory;
