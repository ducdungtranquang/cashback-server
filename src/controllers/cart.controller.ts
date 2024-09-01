import { Request, Response } from 'express';
import Cart from '../models/cart.model';

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { productName, price, productLink, cashbackPercentage, quantity } = req.body;

        if (!productName || !price || !productLink || !cashbackPercentage || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const cartItem = await Cart.create({
            userId: (req?.user as any)?._id,
            productName,
            price,
            productLink,
            cashbackPercentage,
            quantity,
        });

        res.status(201).json(cartItem);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};
