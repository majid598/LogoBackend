import express from "express";
import passport from "passport";
import {
  deleteAccount,
  editProfile,
  emailVerify,
  getOtp,
  login,
  logout,
  myProfile,
  newUser,
  resendEmail,
  resetPassword,
} from "../Controllers/user.js";
import { isAuthenticated } from "../Middlewares/auth.js";
const router = express.Router();

router.post("/new", newUser);

router.post("/login", login);

router.get("/verify-email", emailVerify);

router.get("/otp", getOtp);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/login",
(req, res, next) => {
    passport.authenticate('google', (err, data) => {
      if (err) {
        return next(err);
      }
      if (!data) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Here you can set the JWT token in a cookie or send it in the response body
      res.status(200).json({token:data.token}); // Set the JWT in an HTTP-only cookie
      res.redirect('/'); // Redirect to the desired URL after login
    })(req, res, next);
  });


router.get("/logout", isAuthenticated, logout);

router.get("/me", isAuthenticated, myProfile);

router.post("/resend-email", isAuthenticated, resendEmail);

router.put("/me/profile/edit", isAuthenticated, editProfile);
router.delete("/me/profile/delete", isAuthenticated, deleteAccount);
router.post("/reset-password", resetPassword);

export default router;
