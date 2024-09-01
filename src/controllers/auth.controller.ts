import { Request, Response } from 'express';
import User from '../models/user.model';
import generateToken from '../ultils/generateToken';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name, accountBank } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide all required fields: email, password, name.' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
            name,
            accountBank,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                name: user.name,
                accountBank: user.accountBank,
                token: generateToken(user._id as string),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

export const authUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword!(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id as string),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};
