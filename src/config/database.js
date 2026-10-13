const express = require('express')
const mongoose = require('mongoose')

const connectDb = async ()=>{
    await mongoose.connect(`mongodb+srv://kumar1si15is026_db_user:YOoplKownqyRqoEu@cluster0.vgnrbmi.mongodb.net/?appName=Cluster0`)
}

module.exports = connectDb