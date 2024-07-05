import bcrypt, { compare } from "bcrypt";
import passport from "passport";
import { TryCatch } from "../Middlewares/error.js";
import { User } from "../Models/user.js";
import { cookieOptions, sendToken } from "../Utils/features.js";
import ErrorHandler from "../Utils/utility.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const newUser = TryCatch(async (req, res, next) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password)
    return next(new ErrorHandler("All Feilds Are Required", 404));

  const verificationToken = crypto.randomBytes(16).toString("hex");

  const user = await User.create({
    email,
    name,
    password,
    verificationToken,
  });

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL,
    to: email,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link.`,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
  a{
  padding:10px 20px;
  background-color:white;
  color:blue;
  border-radius:6px;
  font-weight:bold;
  }
  </style>
</head>
<body>
  <h1>Please verify your email by clicking on the following link</h1>
  <a href=${verificationLink}>
  Verify Email
  </a>
</body>
</html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending mail. Please try again.");
    }
    console.log("Mail sent successfully!");
  });

  sendToken(
    res,
    user,
    200,
    `Verification email sent. Please check your email.`
  );
});

const emailVerify = TryCatch(async (req, res, next) => {
  const { token } = req.query;
  const user = await User.findOne({ verificationToken: token });
  if (!user) return next(new ErrorHandler("Invalid or expired token", 400));
  user.verified = true;
  user.verificationToken = undefined;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now log in.",
  });
});
const resendEmail = TryCatch(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User Not Found", 400));
  if (user.verified)
    return next(new ErrorHandler("Your Email is Already Verified!", 400));
  const verificationToken = crypto.randomBytes(16).toString("hex");
  user.verificationToken = verificationToken;

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL,
    to: email,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link.`,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
  a{
  padding:10px 20px;
  background-color:white;
  color:blue;
  border-radius:6px;
  font-weight:bold;
  }
  </style>
</head>
<body>
  <h1>Please verify your email by clicking on the following link</h1>
  <a href=${verificationLink}>
  Verify Email
  </a>
</body>
</html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending mail. Please try again.");
    }
    console.log("Mail sent successfully!");
  });

  await user.save();
  return res.status(200).json({
    success: true,
    message: "Verification email resent. Please check your email.",
  });
});

const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Email Or Password", 404));

  const isMatch = await compare(password, user.password);

  if (!isMatch) return next(new ErrorHandler("Invalid Email Or Password", 404));

  sendToken(res, user, 200, `Welcome Back Mr ${user.name}`);
});

const myProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  return res.status(200).json({
    success: true,
    user,
  });
});

const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("logoMaker-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

const googleLogin = TryCatch(async (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] });
});

const editProfile = TryCatch(async (req, res, next) => {
  const { name, profile } = req.body;
  const updatedData = {
    name,
    profile,
  };
  const user = await User.findByIdAndUpdate(req.user, updatedData);
  if (!req.user) return next(new ErrorHandler("No Account Found!", 404));

  await user.save();
  return res.status(200).json({
    success: true,
    message: "Account Updated",
  });
});

const resetPassword = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("No Account Found!", 404));

  user.password = bcrypt.hash(password, 10);

  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password Reseted",
  });
});

const getOtp = TryCatch(async (req, res, next) => {
  const generateOtp = () => {
    const otp = Math.floor(Math.random() * 90000) + 10000;
    return otp;
  };
  const otp = generateOtp();
  return res.status(200).json({
    success: true,
    message: `Your Otp is ${otp}`,
  });
});

const deleteAccount = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Account Deleted",
  });
});

export {
  editProfile,
  googleLogin,
  login,
  logout,
  myProfile,
  newUser,
  resetPassword,
  emailVerify,
  getOtp,
  deleteAccount,
  resendEmail,
};
