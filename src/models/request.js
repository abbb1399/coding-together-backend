const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
    trim:true
  },
  // message:{
  //   type:String,
  //   required:true,
  //   trim:true
  // },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
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
  isRead:{
    type:Boolean,
    default: false
  }


},{
  timestamps: true
})


const Request = mongoose.model('Request', requestSchema)

module.exports = Request