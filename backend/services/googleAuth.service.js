import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback",
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                let user = await User.findOne({ email: email.toLowerCase() });

                if (user) {
                    // Update existing user with Google info if not already set
                    if (!user.profile.firstName) user.profile.firstName = profile.name.givenName;
                    if (!user.profile.lastName) user.profile.lastName = profile.name.familyName;
                    if (!user.profile.avatar) user.profile.avatar = profile.photos[0]?.value;

                    user.source = "google"; // Mark as google user or update
                    user.status = "active";
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        email: email.toLowerCase(),
                        source: "google",
                        status: "active",
                        profile: {
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName,
                            avatar: profile.photos[0]?.value,
                        },
                        activity: {
                            lastLogin: new Date(),
                            loginCount: 1,
                            lastActive: new Date(),
                        },
                        subscription: {
                            plan: "free",
                        }
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
