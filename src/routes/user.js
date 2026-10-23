const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const ConnectionRequest = require("../models/connectionRequest");

const User = require("../models/user");

const userRouter = express.Router();

const SAFE_USER_DATA = ["firstName", "lastName", "skills"];

//Get all pending conncetions for loggedin users
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  // console.log('hello')

  try {
    const loggedInuser = req.user;

    const connection = await ConnectionRequest.find({
      toUserId: loggedInuser._id,
      status: "interested",
    }).populate("fromUserId", SAFE_USER_DATA);

    res.json({
      message: "Data fetched",
      data: connection,
    });
  } catch (error) {
    res.status(400).send({
      message: "Cant fetched" + error.message,
    });
  }
});

userRouter.get("/user/connection", userAuth, async (req, res) => {
  try {
    const loggedInuser = req.user;

    let conn = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInuser._id, status: "accepted" },
        { toUserId: loggedInuser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", SAFE_USER_DATA)
      .populate("toUserId", SAFE_USER_DATA);

    if (!conn) {
      return res.status(404).send("Error in fetch" + error.message);
    }
    if (!conn.length) {
      return res.json({
        message: "NO ANY CONNECTION",
      });
    }

    const data = conn.map((row) => {
      // console.log('-->',row.fromUserId._id.toString(),loggedInuser._id.toString())
      if (row.fromUserId._id.toString() === loggedInuser._id.toString()) {
        return row.toUserId;
      }

      return row.fromUserId;
    });

    res.json({ data });
  } catch (error) {
    res.status(400).send("Error in fetch" + error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInuser = req.user;

    const page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10

    limit = limit > 50 ? 50 : limit 

    const skip = (page-1)*limit

    const conn = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInuser._id }, { toUserId: loggedInuser._id }],
    })
      .select("fromUserId toUserId")
      .populate("fromUserId", SAFE_USER_DATA)
      .populate("toUserId", SAFE_USER_DATA);

    const hideUserfromFeed = new Set();

    conn.forEach((val) => {
      hideUserfromFeed.add(val.fromUserId);
      hideUserfromFeed.add(val.toUserId);
    });

    // $in -- not in 
    // $ne -- not include

    const userInFeed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserfromFeed) } },
        { _id: { $ne: loggedInuser._id } },
      ],
    }).select(SAFE_USER_DATA).skip(skip).limit(limit);

    // console.log('c',conn)

    res.json({data : userInFeed});
  } catch (error) {
    res.status(400).send({
      message: "Something went Wrong",
    });
  }
});

module.exports = userRouter;
