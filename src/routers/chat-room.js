const express = require("express")
const ChatRoom = require("../models/chat-room")
const ChatMessage = require("../models/chat-message")
const auth = require("../middleware/auth")
const router = new express.Router()

// 방이 있는지 확인
router.get("/checkroom/:roomId", async (req, res) => {
  try {
    const room = await ChatRoom.find({ roomId: req.params.roomId })

    res.send(room)
  } catch (e) {
    res.status(500).send()
  }
})

// 방생성
router.post("/chatroom", async (req, res) => {
  const chatRoom = new ChatRoom({
    ...req.body,
  })

  try {
    await chatRoom.save()
    res.status(201).send(chatRoom)
  } catch (e) {
    res.status(400).send(e)
  }
})

// 내가 속하는 방 리스트 불러오기
router.get("/roomList/:page", auth, (req, res) => {
  const _id = req.user._id.toHexString()
  const page = parseInt(req.params.page)
  const perPage = 5
  const skipPage = page === 1 ? 0 : (page - 1) * perPage

  try {
    ChatRoom.find({ users: { $elemMatch: { _id } } })
      .populate({ path: "articleOwner", select: "name email" })
      .skip(skipPage)
      .limit(perPage)
      .sort({ updatedAt: -1 })
      .exec(async (error, rooms) => {
        if (error) {
          throw Error("에러~~")
        }
        const total = await ChatRoom.countDocuments({users: { $elemMatch: { _id } }})

        const roomlist = []
        for(let room of rooms){
          // 제일 마지막 메세지 (5번 돌아서 큰 부담은 없을듯)
          const [latest] = await ChatMessage.find({owner:room.roomId}).sort({date: -1}).limit(1)
          
          const roomData = {
            roomId: room.roomId,
            roomName: room.roomName,
            avatar: room.avatar,
            users: room.users,
            articleOwner: room.articleOwner,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            latestMsg: latest.deleted ? '삭제 되었습니다.' : latest.content,
          }     
          roomlist.push(roomData)
        }

        res.send({ roomlist, total })
      })
  } catch (e) {
    res.status(500).send()
  }
})

// 입장한 방 정보 불러오기
router.get("/chatroom/:roomId", async (req, res) => {
  try {
    const room = await ChatRoom.findOne({ roomId: req.params.roomId })

    if (!room) {
      return res.status(404).send()
    }

    res.send(room)
  } catch (e) {
    res.status(500).send()
  }
})

// 방 입장
router.patch("/chatroom", auth, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findOne({ roomId: req.body.roomId })

    if (!chatRoom) {
      return res.status(404).send()
    }

    const newUser = { _id: req.user._id.toHexString(), username: req.user.name }

    const inRoom = chatRoom.users.find(
      (user) => JSON.stringify(user) === JSON.stringify(newUser)
    )

    if (!inRoom) {
      chatRoom.users.push(newUser)
      chatRoom.save()
    }

    res.send()
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router
