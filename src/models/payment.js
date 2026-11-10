const mongoose = require('mongoose')

const paymentSchema =  new mongoose.Schema(
    {
        userId:{
            ref:'User',
            type:mongoose.Types.ObjectId,
            required :true
        },
        
        orderId : {
            type:String ,
            required :true
        },
        amount : { 
            type : Number,
            required:true
        },
        status:{
            type:String,
            required:true
        },
        currency:{
            type:String,
            required:true
        },
        recepit:{
            type:String,
            required:true
        },
        notes:{
            firstName:{ 
                type:String ,
             
            },
            lastName:{
                type:String ,
             
            },
            memberShiptype:{
                type:String ,
            }
        }

    },
    {
        timestamps : true
    }
)

module.exports =  mongoose.model('payment',paymentSchema)