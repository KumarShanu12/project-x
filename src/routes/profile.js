const express = require('express')
const User = require("../models/user");
const profileRouter = express.Router()
const {userAuth } = require("../middlewares/userAuth")
const {validateEditData} = require('../utils/validationSignUp');
const user = require('../models/user');

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
  
     
  
      const { firstName, lastName, emailId } = req.user;
      res.send({ firstName, lastName, emailId });
    } catch (error) {
      res.status(400).send("Error: " + error.message);
    }
  });


  profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {


        if(!validateEditData(req)){
            throw new Error("Error");
            
        }

        const loggedInuser = req.user

        Object.keys(req.body).forEach((k)=>(loggedInuser[k]=req.body[k]))

        // console.log('loggedInuser',loggedInuser)

        await loggedInuser.save()


        res.send({message :'updated', data : loggedInuser })

        

     
  
    //   const { firstName, lastName, emailId } = req.user;
    //   res.send({ firstName, lastName, emailId });
    } catch (error) {
      res.status(400).send("Error: " + error.message);
    }
  });

  module.exports= profileRouter