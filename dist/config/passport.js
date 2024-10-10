"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_model_1 = __importDefault(require("../models/user.model"));
const generateToken_1 = __importDefault(require("../ultils/generateToken"));
const passport_1 = __importDefault(require("passport"));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_model_1.default.findOne({ googleId: profile.id });
        if (!user) {
            user = yield user_model_1.default.create({
                email: profile.emails[0].value,
                name: profile.displayName,
                googleId: profile.id,
            });
        }
        const token = (0, generateToken_1.default)(user._id);
        done(null, {
            _id: user._id,
            email: user.email,
            token: token,
        });
    }
    catch (error) {
        console.error('Error during Google authentication:', error);
        done(error, undefined);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
