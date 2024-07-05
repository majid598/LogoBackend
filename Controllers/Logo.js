import { TryCatch } from "../Middlewares/error.js";
import { Logo } from "../Models/Logo.js";
import { User } from "../Models/user.js";
import ErrorHandler from "../Utils/utility.js";

const newLogo = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  const {
    logoImage,
    bgRounded,
    padding,
    iconSize,
    selectedIcon,
    iconRotation,
    iconColor,
    logoBgColor,
    imageOpacity,
    name,
  } = req.body;

  const logo = await Logo.create({
    logoImage,
    bgRounded,
    padding,
    iconSize,
    selectedIcon,
    iconRotation,
    iconColor,
    logoBgColor,
    imageOpacity,
    name,
    user: req.user,
  });

  await user.logos.push(logo);
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Logo Downloaded",
  });
});

const myLogos = TryCatch(async (req, res, next) => {
  const logos = await Logo.find({ user: req.user }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    logos,
  });
});
const deleteLogo = TryCatch(async (req, res, next) => {
  const logo = await Logo.findById(req.params.id);
  const user = User.findById(req.user);

  await logo.deleteOne();
  // user.logos.pull(req.params.id);
  // await user.save();

  return res.status(200).json({
    success: true,
    message: "Logo deleted",
  });
});

const editLogo = TryCatch(async (req, res, next) => {
  const {
    logoImage,
    bgRounded,
    padding,
    iconSize,
    selectedIcon,
    iconRotation,
    iconColor,
    logoBgColor,
    imageOpacity,
  } = req.body;
  const updatedData = {
    logoImage,
    bgRounded,
    padding,
    iconSize,
    selectedIcon,
    iconRotation,
    iconColor,
    logoBgColor,
    imageOpacity,
  };
  const logo = await Logo.findByIdAndUpdate(req.params.id, updatedData);
  if (!req.params.id) return next(new ErrorHandler("No Logo Found!", 404));

  await logo.save();
  return res.status(200).json({
    success: true,
    message: "Logo Updated",
  });
});

export { newLogo, myLogos, deleteLogo, editLogo };
