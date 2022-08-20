const express = require('express')
const cors = require('cors')

const path = require('path')
const http = require('http')
const socketio  = require('socket.io')
const socket = require('./socket/socket')

const app = express()
const port = process.env.PORT
const server = http.createServer(app)

// db 연결
require('./db/mongoose')

// Router
const userRouter = require('./routers/user')
const articleRouter = require('./routers/article')
const requestRouter = require('./routers/request')
const scheduleRouter = require('./routers/schedule')
const chatRoomRouter = require('./routers/chatRoom')
const chatMessageRouter = require('./routers/chatMessage')
const kanbanRouter = require('./routers/kanban')

app.use(express.json()) // incoming json to object
app.use(
  cors({
    origin: '*'
  })
);


app.use(userRouter)
app.use(articleRouter)
app.use(requestRouter)
app.use(scheduleRouter)
app.use(chatRoomRouter)
app.use(chatMessageRouter)
app.use(kanbanRouter)

// 소켓 세팅
// const io = socketio(server)
const io = socketio(server,{
  cors: {
    origin: "*"
  }
})

// Setup static directory to serve
const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))


// socket.io 코드
socket(io)

server.listen(port, () => {
  console.log('서버 작동 중 PORT:' + port)
})