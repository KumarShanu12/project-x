const validator = require('validator')

const validationSignUp = (req) =>{

    const {firstName ,lastName, emailId,password} = req.body

    // console.log(firstName,lastName)

    if(!firstName || !lastName){
        throw new Error('Name incorrect')
        // return { success: true, message: 'Validation passed' }
    }

    else if(!validator.isEmail(emailId)){
        throw new Error('Invalid EMAIL')
    }

    //  if(!validator.isEmail(email)){

    //     throw new Error('Invalid EMAIL')

    // }


    

}

const validateEditData = (req)=>{

    const allowed = ["age","firstName"]

    const isAllowed = Object.keys(req.body).every(v=> allowed.includes(v))

    return isAllowed

}

module.exports={
    validationSignUp,
    validateEditData

}