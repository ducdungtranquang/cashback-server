import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            const { id, emails, displayName } = profile;
            const email = emails?.[0].value;

            try {
                let user = await User.findOne({ googleId: id });

                if (!user && email) {
                    user = await User.findOne({ email });
                }

                if (!user) {
                    user = new User({
                        name: displayName,
                        email: email!,
                        googleId: id,
                    });
                    await user.save();
                }

                done(null, user);
            } catch (err) {
                done(err, undefined);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err: any, user: any) => done(err, user));
});
