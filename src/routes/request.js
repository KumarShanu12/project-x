const express = require('express')
const {userAuth} = require("../middlewares/userAuth")
const requestRouter = express.Router()
const User = require("../models/user");


const connection = require("../models/connectionRequest")



requestRouter.post('/request/send/:status/:toUserId',userAuth,async (req,res)=>{

  
  try {

    const user = req.user;

  const fromUserId = user._id;
  const toUserId = req.params.toUserId;
  const status = req.params.status;

  const allowed = ["ignored","interested"];

  if(!allowed.includes(status)){
    return res.status(400).json({message : "Invalid status" + status})
  }

  if(fromUserId===toUserId){
    return res.status(400).json({message : "to from cant same"})
  }

  const toUser = await User.findById(toUserId)

 

  if(!toUser){
    return res.status(404).send({
        message : 'this user not present in db'
    })
  }

//   console.log('toUser',)

  const connectionPresent = await connection.findOne({
    $or:[
            {fromUserId,
                toUserId},
                {fromUserId:toUserId,
    toUserId:fromUserId}
    ]
    
  })

 

  console.log('connectionPresent',connectionPresent)

  if(connectionPresent){
    return  res.status(400).json({message : "connection already present"})
  }

  const ConnectionRequest = new connection({
    fromUserId,toUserId,status
  })

  const data = await ConnectionRequest.save()

 

res.json({
    message:user.firstName + status + toUser.firstName ,
     
    data 
})


   


    // res.send(user.lastName+'is sending set connection')
    
  } catch (error) {

    res.status(400).send("Error: " + error.message);
    
  }

})
module.exports= requestRouter