import { Request, Response } from 'express';
import User from '../models/user.model';
import generateToken from '../ultils/generateToken';

export const registerUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id as string),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export const authUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        res.json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id as string),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};
