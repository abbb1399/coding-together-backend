module.exports = (io) => {
  const {generateMessage} = require('../utils/socket/messages')
  const { addUser, removeUser, getUser, getUsersInRoom} = require('../utils/socket/users')

  io.on('connection', (socket) =>{ 
    socket.on('join',(userInfo, callback) => {
      const {error, user} = addUser({ id:socket.id, ...userInfo })
      
      if(error){
        return callback(error)
      }
  
      socket.join(user.roomId)
  
      // socket.emit('message', generateMessage('Admin', {
      //     content: '환영합니다. 대화를 자유롭게 하세요!',
      //     _id:'admin1234',
      //     senderId:'admin1234'
      //   }) 
      // )
      socket.broadcast.to(user.roomId).emit(
        'message', 
        generateMessage('운영자', {
          _id:'admin1234',
          senderId:'admin1234',
          content:`${user.username}님이 입장하였습니다.!`
        })
      )
      // io.to(user.roomId).emit('roomData', {
      //   roomId: user.roomId,
      //   users: getUsersInRoom(user.roomId)
      // })
  
      callback()
    })
    
    socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id)

      io.to(user.roomId).emit('message', generateMessage(user.username, message))
      callback()
    })

    socket.on('deleteMessage', (msgId, callback) => {
      const user = getUser(socket.id)

      io.to(user.roomId).emit('deleteMessage', msgId)
      callback()
    })
  
    socket.on('updateMessage', (msgData ,callback) => {
      const user = getUser(socket.id)

      io.to(user.roomId).emit('updateMessage', msgData)
      callback()
    })
    
    socket.on('disconnect', () =>{
      const user = removeUser(socket.id)
     
      if(user){
        io.to(user.roomId).emit('message', generateMessage('운영자', {
          content: `${user.username}님이 떠났습니다!`,
          _id: 'admin1234',
          senderId:'admin1234'
        }))
        // io.to(user.roomId).emit('roomData',{
        //   roomId: user.roomId,
        //   users: getUsersInRoom(user.roomId)
        // })
  
      }
    })
  })
}