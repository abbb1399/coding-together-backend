const express = require('express')
const ChatRoom = require('../models/chatRoom')
const auth = require('../middleware/auth')
const router = new express.Router()



// 테스트
router.get('/test123', async (req,res)=>{

  const test = await ChatRoom.find({})
 
  res.send(test)
})


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

// 내가 속하는 방 리스트 불러오기
router.get('/roomList', auth, async (req, res) =>{
  const _id = req.user._id.toHexString()

  try{
    const roomlist = await ChatRoom.find({ users: { $elemMatch: {_id}}})

    res.send(roomlist)
  }catch(e){
    res.status(500).send()
  }
})


// 방 입장
router.patch('/chatroom', auth, async (req,res) =>{
  try{
    const chatRoom = await ChatRoom.findOne({ _id : req.body.roomId})
    
    
    if(!chatRoom){
      return res.status(404).send()
    }
    
    const newUser = {_id:req.user._id.toHexString() ,username:req.user.name}
    

    if(chatRoom.users.find(el=> JSON.stringify(el) !== JSON.stringify(newUser))){
      chatRoom.users.push(newUser)
      chatRoom.save()
    }

    res.send()
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router