const mongoose = require('mongoose')

const chatRoomSchema = new mongoose.Schema({
  roomId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    unique:true
  },
  roomName:{
    type:String,
    required: true
  },
  avatar:{
    type:String,
    // required:true
  },
  users:{
    type: Array,
    // required: true
  },
  articleOwner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
},{
  timestamps: true
})

// chatRoomSchema.methods.toJSON = function(){
//   const room = this
//   const roomObject = room.toObject()

//   roomObject.roomId = roomObject._id
//   delete roomObject._id

//   return roomObject
// }

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)

module.exports = ChatRoom