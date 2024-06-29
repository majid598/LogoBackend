import mongoose, { model } from "mongoose";

const schema = mongoose.Schema(
  {
    logoImage: String,
    bgRounded: Number,
    padding: Number,
    iconSize: Number,
    selectedIcon: String,
    iconRotation: Number,
    iconColor: String,
    logoBgColor: String,
    imageOpacity: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Logo = mongoose.models.Logo || model("Logo", schema);
