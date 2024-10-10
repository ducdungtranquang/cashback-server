import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token để lấy id người dùng
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Lấy thông tin người dùng từ database và gán vào req.user
      req.user = (await User.findById(decoded.id).select("-password")) as IUser;

      next(); // Chuyển sang middleware hoặc route handler tiếp theo
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
