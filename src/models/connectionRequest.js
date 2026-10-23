const mongoose = require("mongoose");
// const User = require('../models/user')

const sendConnectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User"
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User"
    },

    status: {
      type: String,
      enum: ["ignored", "interested", "accepted", "rejected"],
      message: `{VALUE} is incorrect status type`,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);


// this is for making mongodb find query fast , here we are making compound indexing (2 field me)
sendConnectionRequestSchema.index({
    fromUserId:1,
    toUserId:1
})

sendConnectionRequestSchema.pre("save",function(next){

    const connectionRequest = this;

    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        return next(new Error("You cannot send a connection request to yourself"));
        }


    next;

})

module.exports = mongoose.model("Connection", sendConnectionRequestSchema);
