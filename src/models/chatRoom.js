const mongoose = require('mongoose')

const chatRoomSchema = new mongoose.Schema({
  roomId:{
    type: String,
    required: true
  },
  roomName:{
    type:String,
    required: true
  },
  avatar:{
    type:String,
    required:true
  },
  users:{
    type: Array,
    // required: true
  }
},{
  timestamps: true
})

// virtual property with chatMessage
chatRoomSchema.virtual('chatMessages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'owner'
  // 여기 user_id와 chatMessage onwer가 같을때
})

const Chatroom = mongoose.model('ChatRoom', chatRoomSchema)

module.exports = Chatroom