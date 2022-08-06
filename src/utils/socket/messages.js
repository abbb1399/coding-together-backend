const generateMessage = (username, {_id,senderId,content, replyMessage}) =>{
  return{
    _id,
    senderId,
    username,
    content,
    date: new Date(),
    timestamp: new Date().toString().substring(16, 21),
    replyMessage
  }
}

module.exports = {
  generateMessage
}