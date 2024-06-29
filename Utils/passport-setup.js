import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { User } from "../Models/user.js";
import { sendToken } from "./features.js";

export const connectPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        const user = await User.findOne({
          googleId: profile.id,
        });

        if (!user) {
          const newUser = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            profile: profile.photos[0].value,
            verified: profile._json.email_verified,
            password: profile._json.given_name,
          });
          return done(null, newUser);
        } else {
          return done(null, user);
        }
      }
    )
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(null, false, { message: "User not found." });
          }

          // Match password using bcrypt
          const isMatch = await bcrypt.compare(password, user.password);

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
