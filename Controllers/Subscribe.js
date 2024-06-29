import { TryCatch } from "../Middlewares/error.js";
import { User } from "../Models/user.js";
import { stripe } from "../app.js";

const subscribe = TryCatch(async (req, res, next) => {
  const { plan, amount, currency } = req.body;
  console.log(plan, amount, currency)

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
  });

  console.log(paymentIntent.client_secret);

  const user = await User.findById(req.user);
  user.isSubscribed = true;
  user.subscribedPlan = plan;

  await user.save();

  return res.status(200).json({
    success: true,
    message: `You Have Subscribe Plan For ${plan}`,
    client_secret: paymentIntent.client_secret,
  });
});

const unSub = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  user.isSubscribed = false;
  user.subscribedPlan = "";

  await user.save();

  return res.status(200).json({
    success: true,
    message: `You Have unSubscribed to Your Plan`,
  });
});

export { subscribe, unSub };

