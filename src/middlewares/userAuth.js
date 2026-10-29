const jwt = require('jsonwebtoken')
const User = require("../models/user")
const userAuth = async (req, res, next) => {
    try {
      console.log("Cookies:", req.cookies); // Debugging log
      const token = req.cookies.token;
  
      if (!token) {
        // throw new Error("Authentication failed: No token provided");

        res.status(401).send('Token is not Valid , Try Login again !!')
      }

      const decoded = jwt.verify(token, "SHANU");
      console.log('decoded',decoded)
      const user = await User.findById(decoded._id);
      console.log('user',user)
      if (!user) {
        throw new Error("User not found");
      }
      console.log("Decoded Token:", decoded); // Debugging log
      req.user = user;
      next();
    } catch (error) {
      res.status(401).send("Authentication failed: " + error.message);
    }
  };

  module.exports={
    userAuth
  }