const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const validator = require('validator')

const userSchema = mongoose.Schema({
    firstName : {
        type: String,
        required : true,
        // minLength : 15
    },
    lastName : {
        type : String,
        required : true,
        // minLength : 15
    },
    emailId : {
        
        type : String,
        unique : true,
        required : true,
        
        lowercase : true,
        trim : true,
        // validate(value){
        //     if(!validator.isEmail(value)){
        //         throw new Error('invalid Email',value)
        //     }
        // }
    },
    password : {
        type : String,
        required : true   
    },
    age:{
        type: Number,
        min : 8
         

    },
    gender : {
        type: String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                        throw new Error('not valid gender')
            }
        } 
    },
    photoUrl :{
         type : String,
        //  validate(value){
        //     if(!validator.isURL(value)){
        //         throw new Error('invalid URL',value)
        //     }
        // },
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRICx31hto7pdeK9C4ydVj4y9nXFEfmG72p4x8vhtKFCA&s=10"
    },
    skills : {
        type: [String],
        validate(value){
            if(value.length > 4){
                        throw new Error('Greater than 4 skillls')
            }
        } 
        
    },




    
    


}, 
{
    timestamps : true
}
)




// jwt token ko offload kiye idahr .
userSchema.methods.getJWT = async function () {

    const user = this;

    const token =  await jwt.sign({_id:user.id},'SHANU',{
              expiresIn :"7d"
            })

            return token
    
   
    
}


// password logic ko kro

userSchema.methods.validatePassword = async function(passwordByInput){
    const user  = this
    const passwordHash = user.password

    const isPasswordValid = await bcrypt.compare(passwordByInput, passwordHash)

    return isPasswordValid
    
}




module.exports = mongoose.model("User",userSchema)