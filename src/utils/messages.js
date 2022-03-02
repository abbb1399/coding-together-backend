const generateMessage = (username, msg) =>{
  return{
    _id: msg._id,
    senderId: msg.senderId,
    username,
    text: msg.content,
    date: new Date(),
    timestamp: new Date().toString().substring(16, 21),
  }
}


module.exports = {
  generateMessage
}