import { Request, Response } from "express";
import Cart from "../models/cart.model";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const {
      productName,
      price,
      productLink,
      cashbackPercentage,
      quantity,
      productId,
      productImg,
    } = req.body;

    if (
      !productName ||
      !price ||
      !productLink ||
      !quantity ||
      !productId
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const existingCartItem = await Cart.findOne({
      userId: (req?.user as any)._id,
      productName,
      productLink,
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();

      return res.status(200).json({
        message: "Product quantity updated successfully.",
        cartItem: existingCartItem,
      });
    } else {
      const newCartItem = await Cart.create({
        userId: (req?.user as any)._id,
        productName,
        price,
        productLink,
        cashbackPercentage,
        quantity,
        productId,
        productImg,
      });

      return res.status(201).json({
        message: "Product added to cart successfully.",
        cartItem: newCartItem,
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const updateCartQuantity = async (req: Request, res: Response) => {
  try {
    const { productId, newQuantity } = req.body;

    if (!productId || !newQuantity) {
      return res
        .status(400)
        .json({ message: "Please provide product ID and new quantity." });
    }

    const cartItem = await Cart.findOne({
      userId: (req?.user as any)._id,
      _id: productId,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    cartItem.quantity = newQuantity;
    await cartItem.save();

    res
      .status(200)
      .json({ message: "Product quantity updated successfully.", cartItem });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !productIds.length) {
      return res.status(400).json({ message: "No product IDs provided." });
    }

    await Cart.deleteMany({
      userId: (req?.user as any)._id,
      _id: { $in: productIds },
    });

    res
      .status(200)
      .json({ message: "Products removed from cart successfully." });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const total = await Cart.countDocuments({ userId: (req?.user as any)._id });

    const cartItems = await Cart.find({ userId: (req?.user as any)._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
