const express = require('express')
const User = require("../models/user");
const authRouter = express.Router()

const bcrypt = require("bcrypt")
const {validationSignUp} = require('../utils/validationSignUp')
authRouter.post("/login",async(req,res)=>{

    try {
        // validationSignUp(req);

        

        
 
        const {emailId,password} = req.body

        console.log('req',req)

        const user = await User.findOne({emailId:emailId })

        // const token = await jwt.sign({_id:user.id},'SHANU',{
        //   expiresIn :"7d"
        // })

        const token = await user.getJWT()

        res.cookie('token',token)

        if(!user){
            throw new Error("User not found")
        }
 
        // const isPasswordValid = await bcrypt.compare(password, user.password)

        const isPasswordValid  = await user.validatePassword(password, user.password)



        if(isPasswordValid){
            res.send(user)
        }
 
        
  
 
    //  console.log(user)
     
   
   } catch (error) {
     res.status(400).send("error hai" + error.message);
   }

})

authRouter.post("/signup", async (req, res) => {

//   console.log(user)

  try {
       validationSignUp(req);

       const {password,emailId,firstName,lastName} = req.body

       const hashedPassword = await bcrypt.hash(password,10)

       

    const user = new User({
        firstName,lastName,password:hashedPassword,emailId
    });

    // const user = new User(res.body);

    console.log(user)

    const token = await user.getJWT()

        res.cookie('token',token)
    
      await user.save();
    res.json({message:"User added" , user});
  } catch (error) {
    res.status(400).send("error hai"+error.message);
  }
});


authRouter.post("/logout", async (req, res) => {
res.cookie('token',null,
   { expires: new Date(Date.now())},
)


    //   console.log(user)
    
      try {
           
        res.send("Logged Out ");
      } catch (error) {
        res.status(400).send("error logout"+error.message);
      }
    });


     



module.exports= authRouter
