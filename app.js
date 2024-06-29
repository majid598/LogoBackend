import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import { errorMiddleware } from "./Middlewares/error.js";
import { connectDb } from "./Utils/db.js";
import Stripe from "stripe";
import session from "express-session";
const app = express();

dotenv.config({
  path: "./.env",
});

app.use(
  session({
    secret: "hey",
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://logo-maker-nine.vercel.app",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.enable("trust proxy");

export const stripe = new Stripe(process.env.STRIPE_KEY)

connectPassport();

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server Is Working Perfectly");
});

import logoRoute from "./Routes/Logo.js";
import subscribeRoute from "./Routes/Subscribe.js";
import userRoute from "./Routes/user.js";
import { connectPassport } from "./Utils/passport-setup.js";

connectDb(process.env.MONGO_URI);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/logo", logoRoute);
app.use("/api/v1/subscribe", subscribeRoute);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is runnig at port number ${PORT}`);
});
