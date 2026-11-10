const express = require("express");

const paymentRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

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

    //   const {user} = req

    //   console.log(req.user)
    //Save to db

    const payment = new Payment({
      userId: req.user._id,

      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      notes: order.notes,
      recepit: order.receipt,
    });

    const savedDb = await payment.save();

    // return back the result

    res.status(200).send({ ...savedDb.toJSON(), keyId: process.env.RAZOR_PAY_KEY_ID });
  } catch (error) {
    return res.status(500).send({ message: "OOps", data: error.message });
  }
});

paymentRouter.post("/payment/webhook",express.raw({ type: "application/json" }), async (req, res) => {
  console.log(req.body)
  
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log('Webhook Signature:', webhookSignature); 
    const isWebHookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZOR_PAY_WEBHOOK_SECRET
    );

    if (!isWebHookValid) {
      return res.status(400).json({ msg: "Webhook failed !!" });
    }

    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.memberShiptype = payment.notes.memberShiptype;
    await user.save();

    // if(req.body.event === 'payment.captureed'){

    // }

    // if(req.body.event === 'payment.failed'){

    // }

    return res.status(200).json({ msg: "Webhook received successfully !!" });
   
});

module.exports = paymentRouter;
