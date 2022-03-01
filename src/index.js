const express = require('express')
const cors = require('cors')

const path = require('path')
const http = require('http')
const socketio  = require('socket.io')
const {generateMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

// db 연결
require('./db/mongoose')

// Router
const userRouter = require('./routers/user')
const articleRouter = require('./routers/article')
const requestRouter = require('./routers/request')
const scheduleRouter = require('./routers/schedule')

const app = express()
const port = process.env.PORT

// 소켓 세팅
const server = http.createServer(app)
// const io = socketio(server)
const io = socketio(server,{
  cors: {
    origin: "*"
  }
})

// Setup static directory to serve
const publicDirectoryPath = path.join(__dirname,'../../frontend/src')
app.use(express.static(publicDirectoryPath))

app.use(express.json()) // incoming json to object
app.use(cors())

app.use(userRouter)
app.use(articleRouter)
app.use(requestRouter)
app.use(scheduleRouter)

// 소켓 연결
io.on('connection', (socket) =>{
  console.log('소켓 연결')

  socket.on('join',(options, callback)=>{
    const {error, user} = addUser({ id:socket.id, ...options })
    
    if(error){
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Admin', '환영합니다. 대화를 자유롭게 하세요!') )
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username}님이 입장하였습니다.!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    
    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  })

  socket.on('disconnect', () =>{
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username}님이 떠났습니다!`))
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
      // console.log('나갓음')
    }
  })
})


server.listen(port, () => {
  console.log('서버 작동 중 PORT ' + port)
})

