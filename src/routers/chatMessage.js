const express = require('express')
const ChatMessage = require('../models/chatMessage')
const auth = require('../middleware/auth')
const router = new express.Router()

// 메세지 생성하기
router.post('/chatMessages', async(req,res)=>{
  const chatMessage = new ChatMessage({
    ...req.body
  })

  try{
    await chatMessage.save()
    res.status(201).send(chatMessage)
  }catch(e){
    res.status(400).send(e)
  }
})


// 해당방 메세지 모두 불러오기
router.get('/chatMessages/:owner', async (req,res) =>{
  const owner = req.params.owner

  try{
    const chatMessage = await ChatMessage.find({ owner })

    if(!chatMessage){
      return res.status(404).send()
    }
    res.send(chatMessage)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router