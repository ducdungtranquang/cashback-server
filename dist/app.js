"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const withdraw_routes_1 = __importDefault(require("./routes/withdraw.routes"));
const tree_routes_1 = __importDefault(require("./routes/tree.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const purchaseHistory_routes_1 = __importDefault(require("./routes/purchaseHistory.routes"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
require("./config/passport");
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 60000,
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_URI || "",
    }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/user", user_route_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/withdraw", withdraw_routes_1.default);
app.use("/api/garden", tree_routes_1.default);
app.use("/api/product", product_routes_1.default);
app.use("/api/purchase-history", purchaseHistory_routes_1.default);
exports.default = app;
