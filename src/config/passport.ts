import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import generateToken from '../ultils/generateToken';
import passport from 'passport';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.create({
                    email: profile.emails![0].value,
                    name: profile.displayName,
                    googleId: profile.id,
                    isVerified: true,
                });
            }

            const token = generateToken(user._id as string);

            done(null, {
                _id: user._id,
                email: user.email,
                token: token,
            });
        } catch (error) {
            console.error('Error during Google authentication:', error);
            done(error, undefined);
        }
    }));

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
