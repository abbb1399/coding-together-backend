const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
    trim:true
  },
  message:{
    type:String,
    required:true,
    trim:true
  },
  coachId:{
    type: String,
    required: true,
  }
},{
  timestamps: true
})

const Request = mongoose.model('Request', requestSchema)

module.exports = Request