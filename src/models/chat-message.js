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
  roomId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ChatRoom'
  },
  deleted:{
    type:Boolean,
    default: false
  },
  edited:{
    type: Date
  },
  replyMessage:{
    type: Object,
    required: false
  }
},{
  timestamps: {createdAt: 'date'}
})

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

module.exports = ChatMessage