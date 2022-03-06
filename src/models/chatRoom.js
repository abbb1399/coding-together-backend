const mongoose = require('mongoose')

const chatRoomSchema = new mongoose.Schema({
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
  }
},{
  timestamps: true
})

chatRoomSchema.methods.toJSON = function(){
  const room = this
  const roomObject = room.toObject()

  roomObject.roomId = roomObject._id
  delete roomObject._id

  return roomObject
}



const Chatroom = mongoose.model('ChatRoom', chatRoomSchema)

module.exports = Chatroom