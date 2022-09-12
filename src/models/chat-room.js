const mongoose = require('mongoose')

const chatRoomSchema = new mongoose.Schema({
  roomName:{
    type:String,
    required: true
  },
  avatar:{
    type:String,
  },
  users:{
    type: Array,
  },
  articleOwner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
},{
  timestamps: true
})

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)

module.exports = ChatRoom