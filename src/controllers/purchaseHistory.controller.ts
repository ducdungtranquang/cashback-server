import { Request, Response } from 'express';
import PurchaseHistory from '../models/purchaseHistory.model';

export const savePurchaseHistory = async (req: Request, res: Response) => {
    try {
        const { productName, price, productLink, cashbackPercentage, quantity } = req.body;

        if (!productName || !price || !productLink || !cashbackPercentage || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // console.log("-----", req);

        const purchaseHistory = await PurchaseHistory.create({
            userId: (req?.user as any)._id,
            productName,
            price,
            productLink,
            cashbackPercentage,
            quantity,
        });

        res.status(201).json(purchaseHistory);
    } catch (error) {
        console.error('Error saving purchase history:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

export const getPurchaseHistory = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;

        const total = await PurchaseHistory.countDocuments({ userId: (req?.user as any)._id });

        const purchaseHistory = await PurchaseHistory.find({ userId: (req?.user as any)._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        res.json({
            page,
            pages: Math.ceil(total / limit),
            total,
            purchaseHistory,
        });
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
}
