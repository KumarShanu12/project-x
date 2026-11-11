const express = require("express");

const paymentRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");

const razorpayInstance = require("../utils/razorpay");

const Payment = require("../models/payment");
const User = require("../models/user");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  const { memberShipType } = req.body;
  const { firstName, lastName, emailId } = req.user;
  const { memberShip } = require("../utils/constants");

  try {
    const order = await razorpayInstance.orders.create({
      amount: memberShip[memberShipType] * 100, // its in paisa
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        emailId: emailId,
        memberShipType: memberShipType,
      },
    });

    // Save to database
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      notes: order.notes,
      receipt: order.receipt, // Fixed typo
    });

    const savedDb = await payment.save();

    // Return the result
    return res.status(200).send({ ...savedDb.toJSON(), keyId: process.env.RAZOR_PAY_KEY_ID });
  } catch (error) {
    console.error("Error creating payment:", error.message);
    return res.status(500).send({ message: "Oops", data: error.message });
  }
});

paymentRouter.post("/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    console.log("Webhook payload:", req.body);

    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature:", webhookSignature);

    const isWebHookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZOR_PAY_WEBHOOK_SECRET
    );

    if (!isWebHookValid) {
      return res.status(400).json({ msg: "Webhook validation failed!" });
    }

    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found!" });
    }

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    user.isPremium = true;
    user.memberShiptype = payment.notes.memberShiptype;
    await user.save();

    return res.status(200).json({ msg: "Webhook processed successfully!" });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    return res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = paymentRouter;