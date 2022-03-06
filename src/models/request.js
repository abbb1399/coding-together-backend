const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  title:{
    type:String,
    trim:true
  },
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
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  roomId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
},{
  timestamps: true
})


const Request = mongoose.model('Request', requestSchema)

module.exports = Request