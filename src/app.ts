import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.route";
import cartRoutes from "./routes/cart.routes";
import withdrawRoutes from "./routes/withdraw.routes";
import gardenRoutes from "./routes/tree.routes";
import purchaseHistoryRoutes from "./routes/purchaseHistory.routes";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import "./config/passport";
import helmet from "helmet";
import searchRoutes from "./routes/search.routes";
import productRoutes from "./routes/product.routes";
import shopRoutes from "./routes/shop.routes";

dotenv.config();
connectDB();

const app = express();

// const corsOptions = {
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };

app.use(cors());
app.use(helmet());

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 60000,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/garden", gardenRoutes);
// app.use("/api/product", productRoutes);
// app.use("/api/shop", shopRoutes);
app.use("/api/purchase-history", purchaseHistoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shops", shopRoutes);

export default app;
