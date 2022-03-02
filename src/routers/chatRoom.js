const express = require('express')
const ChatRoom = require('../models/chatRoom')
const auth = require('../middleware/auth')
const router = new express.Router()

// 방생성
router.post('/chatroom', async(req,res) =>{
  const chatRoom = new ChatRoom({
    ...req.body
  })

  try{
    await chatRoom.save()
    res.status(201).send(chatRoom)
  }catch(e){
    res.status(400).send(e)
  }
})

// 방 하나 불러오기
router.get('/chatroom/:id', async (req,res) =>{
  const _id = req.params.id

  try{
    const chatRoom = await ChatRoom.findOne({ _id})

    if(!chatRoom){
      return res.status(404).send()
    }
    res.send(chatRoom)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router