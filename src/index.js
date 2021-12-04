const express = require('express')
const cors = require('cors')

// 그냥 db 연결만
require('./db/mongoose')

// Router 가져오기
const userRouter = require('./routers/user')
const coachRouter = require('./routers/coach')
const requestRouter = require('./routers/request')

const app = express()
const port = process.env.PORT

app.use(express.json()) // incoming json to object
app.use(cors())
app.use(userRouter)
app.use(coachRouter)
app.use(requestRouter)

app.listen(port, () => {
  console.log('서버 작동 중 PORT ' + port)
})

