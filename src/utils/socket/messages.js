const moment = require('moment')

const generateMessage = (username, {_id,senderId,content, replyMessage}) =>{
  return{
    _id,
    senderId,
    username,
    content,
    date: moment().format("YYYY-MM-DD"),
    timestamp: moment().format("HH:mm"),
    replyMessage
  }
}

module.exports = {
  generateMessage
}