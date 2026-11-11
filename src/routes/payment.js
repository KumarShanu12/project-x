const express = require("express");
const crypto = require('crypto');

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
      recepit: order.receipt, // Fixed typo
    });

    const savedDb = await payment.save();

    // Return the result
    return res.status(200).send({ ...savedDb.toJSON(), keyId: process.env.RAZOR_PAY_KEY_ID });
  } catch (error) {
    console.error("Error creating payment:", error.message);
    return res.status(500).send({ message: "Oops", data: error.message });
  }
});

paymentRouter.post("/payment/webhook", express.json(), async (req, res) => {
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

// paymentRouter.post('/api/razorpay-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//   const signature = req.headers['x-razorpay-signature'];
//   const eventId = req.headers['x-razorpay-event-id'];

//   try {
//     // 1. Verify the webhook signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZOR_PAY_WEBHOOK_SECRET)
//       .update(req.body) // req.body is a raw Buffer here
//       .digest('hex');

//     if (signature !== expectedSignature) {
//       console.error("Invalid webhook signature");
//       return res.status(400).send('Invalid signature');
//     }

//     // 2. Check for duplicate events (Idempotency)
//     // Check your database to see if `eventId` has already been processed.
//     const existingEvent = await Payment.findOne({ eventId });
//     if (existingEvent) {
//       console.log(`Duplicate event received: ${eventId}`);
//       return res.status(200).json({ status: 'duplicate' });
//     }

//     // 3. Parse the raw body and handle the event
//     const payload = JSON.parse(req.body.toString());
//     const event = payload.event;

//     switch (event) {
//       case 'payment.captured':
//         try {
//           const payment = payload.payload.payment.entity;
//           console.log(`Payment captured: ${payment.id} for Order: ${payment.order_id}`);

//           // Update your database order status to 'PAID'
//           const paymentDb = await Payment.findOne({ orderId: payment.order_id });
//           if (!paymentDb) {
//             return res.status(404).json({ msg: "Payment not found!" });
//           }

//           paymentDb.status = payment.status;
//           await paymentDb.save();

//           const user = await User.findOne({ _id: paymentDb.userId });
//           if (!user) {
//             return res.status(404).json({ msg: "User not found!" });
//           }

//           user.isPremium = true;
//           user.memberShiptype = payment.notes.memberShiptype;
//           await user.save();

//           return res.status(200).json({ msg: "Payment captured and processed successfully!" });
//         } catch (error) {
//           console.error("Error processing payment.captured:", error.message);
//           return res.status(500).json({ msg: "Error processing payment.captured", error: error.message });
//         }

//       case 'payment.failed':
//         try {
//           const failedPayment = payload.payload.payment.entity;
//           console.log(`Payment failed: ${failedPayment.id}`);

//           // Update your database order status to 'FAILED'
//           const paymentDb = await Payment.findOne({ orderId: failedPayment.order_id });
//           if (!paymentDb) {
//             return res.status(404).json({ msg: "Payment not found!" });
//           }

//           paymentDb.status = failedPayment.status;
//           await paymentDb.save();

//           return res.status(200).json({ msg: "Payment failed and processed successfully!" });
//         } catch (error) {
//           console.error("Error processing payment.failed:", error.message);
//           return res.status(500).json({ msg: "Error processing payment.failed", error: error.message });
//         }

//       default:
//         console.log(`Unhandled event: ${event}`);
//         return res.status(200).json({ msg: `Unhandled event: ${event}` });
//     }
//   } catch (error) {
//     console.error("Webhook Error:", error.message);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// });

module.exports = paymentRouter;