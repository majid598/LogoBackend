import { hash } from "bcrypt";
import mongoose, { model } from "mongoose";
import validator from "validator";

const schema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profile: String,
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscribedPlan: {
      type: String,
    },
    verificationToken: { type: String },
    verified: { type: Boolean, default: false },
    logos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Logo",
      },
    ],
    googleId: String,
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 10);
});

export const User = mongoose.models.User || model("User", schema);
