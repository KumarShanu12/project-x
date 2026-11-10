const cronjob = require('node-cron')
const connectionRequest = require('../models/connectionRequest')

const {subDays, startOfDay, endOfDay} = require('date-fns')

const sendEmail = require('./sendEmail')

// cronjob.schedule('* * * * *' , async()=>{


//     // console.log('hello', new Date())


//     // here i want to send email who got the request last night

//     try {

//         // const res = await sendEmail.run('New Order','Order is received , Please pay Rs.200')

//             //    console.log('res==>',res)
         
//         // const yesterday = subDays(new Date(),1)

//         // const yesterdayStart = startOfDay(yesterday)
//         // const yesterdayDayEnd = endOfDay(yesterday)

//         // const pendingRequest = await connectionRequest.find({
//         //     status:'interested',
//         //     createdAt : {
//         //         $gte : yesterdayStart,
//         //         $lt : yesterdayDayEnd
//         //     }
//         // }).populate('fromUserId toUserId')


        

//         // const listOfEmail = [...new Set(pendingRequest.map((req)=>req.toUserId.emailId))]

//         // console.log('listOfEmail',listOfEmail)

//         // for(const email of listOfEmail){
//         //     try {
//         //         const res = await sendEmail.run('new friend request pending from '+email,'plz accept')

//         //         console.log('res==>',res)
//         //     } catch (error) {
//         //         console.log(error)
//         //     }
//         // }
        
//     } catch (error) {
//         console.log(error)
//     }


// })