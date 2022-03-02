const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
  content:{
    type:String,
    required:true
  },
  senderId:{
    type:String,
    required:true
  },
  username:{
    type:String
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ChatRoom'
  }
},{
  timestamps: {createdAt: 'date'}
})

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

module.exports = ChatMessage