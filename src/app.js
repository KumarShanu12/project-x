const express = require("express");
const app = express();
const connectDb = require("./config/database");
const User = require("./models/user");
// const {userAuth} = require("./middlewares/userAuth")
// const user = require('./models/user');

const cookieParser = require('cookie-parser')
const cors = require('cors')
app.use(cors({
  origin:"http://localhost:5175",
  credentials:true
}))

app.use(express.json());

app.use(cookieParser())




const authRouter =  require("./routes/auth")
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request');
const  userRouter  = require("./routes/user");

app.use('/',authRouter)
app.use('/',profileRouter)
app.use('/',requestRouter)
app.use('/',userRouter)
// const jwt = require("jsonwebtoken");





// const {validationSignUp} = require('./utils/validationSignUp')

// Middleware


// app.post("/signup", async (req, res) => {

// //   console.log(user)

//   try {
//        validationSignUp(req);

//        const {password,emailId,firstName,lastName} = req.body

//        const hashedPassword = await bcrypt.hash(password,10)

       

//     const user = new User({
//         firstName,lastName,password:hashedPassword,emailId
//     });

//     // const user = new User(res.body);

//     console.log(user)
    
//     await user.save();
//     res.send("user added");
//   } catch (error) {
//     res.status(400).send("error hai"+error.message);
//   }
// });

 


// make profile and parse the cookie , cookie-parser package install ho gya 
// TODO:

// app.get("/profile",userAuth,async(req,res)=>{

//   try {
//     const cookie = req.cookies;
//     const {token} = cookie

//     if(!token){
//       throw new Error("Invalid cred");
      
//     }

    

//       const j = await jwt.verify(token,'SHANU')

//       const {_id} = j

//       const user = await User.findById(_id)

//       if(!user){
//         throw new Error("User error");
        
//       }

//       let {firstName,lastName,emailId} = user

//     // console.log('user',user )
//     res.send({firstName,lastName,emailId})

    
//   } catch (error) {
//     res.status(400).send("error hai"+error.message);
//   }


  
// })


// app.get("/profile", userAuth, async (req, res) => {
//   try {

   

//     const { firstName, lastName, emailId } = req.user;
//     res.send({ firstName, lastName, emailId });
//   } catch (error) {
//     res.status(400).send("Error: " + error.message);
//   }
// });





// app.get("/users", async (req, res) => {
//   const emailId = req.body.emailId;

//   try {
//     const users = await User.findOne({ emailId: emailId });

//     if (users.length === 0) {
//       res.status(404).send("Error");
//     } else {
//       res.send(users);
//     }
//   } catch (error) {
//     res.status(404).send("Something Wrong");
//   }
// });

// app.get("/feed", async (req, res) => {
//     try {
//       const users = await User.find({ });
  
//       if (users.length === 0) {
//         res.status(404).send("Error");
//       } else {
//         res.send(users);
//       }
//     } catch (error) {
//       res.status(404).send("Something Wrong");
//     }
//   });


  //delete
  // app.delete("/users", (req, res) => {

  //   const emailId = req.body.emailId;

  //   try {
        
  //       User.deleteOne({ emailId: emailId });
  //       res.send('deleted');

  //   } catch (error) {
  //       res.status(404).send("Something Wrong");
  //   }
  // });


  //patch api

  // app.patch('/user/:userId', async (req, res) => {
  //   const userId = req?.params?.userId;
  //   const data = req.body

  //   try {

  //       const isAllowed = ["gender","age","skills"]

  //       let isAllow = Object.keys(data).every(k=> isAllowed.includes(k))

  //       if(!isAllow){
  //           throw new Error('Not allowed Field')
  //       }

  //       await User.findByIdAndUpdate(userId, data ,{
  //           runValidators : true
  //       });

  //       res.send('updated')
        
  //   } catch (error) {
  //       // console.log(error)
  //       res.status(400).send("Something Wrong",error.message);
  //   }

    

  // })

  


connectDb()
  .then(() => {
    // console.log('yy')
    const PORT = process.env.PORT || 7777;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Start the server
