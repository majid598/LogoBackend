import jwt from "jsonwebtoken";
import ErrorHandler from "../Utils/utility.js";
import { User } from "../Models/user.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies["logoMaker-token"];

  if (!token) return next(new ErrorHandler("Please Login first", 404));

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);

  // const user = await User.findById(decodeData._id);

  // if (!user.verified)
  //   return next(new ErrorHandler("Please Verify Your Email Address", 400));

  req.user = decodeData._id;

  next();
};
