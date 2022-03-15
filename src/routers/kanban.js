const express = require('express')
const Kanban = require('../models/kanban')
const router = new express.Router()
const auth = require('../middleware/auth')

// Kanban Board 생성
router.post('/kanbans', auth, async (req,res) => {
  const kanban = new Kanban({
    ...req.body,
    owner: req.user._id
  })

  try{
    await kanban.save()
    res.status(201).send(kanban)
  }catch(e){
    res.status(400).send(e)
  }
})

// Kanban Board 불러오기
router.get('/kanbans', auth, async (req,res) => {
  try{
    const kanbans = await Kanban.find({owner: req.user._id})
    res.send(kanbans)
  }catch(e){
    res.status(500).send()
  }
})

// Task 생성
router.patch('/tasks', async (req,res) => {
  const {boardId, id, name} = req.body
  
  try{
    const kanban = await Kanban.findOne({ _id : boardId})
    
    if(!kanban){
      return res.status(404).send()
    }
  
    kanban.list.push({id, name})
    kanban.save()

    res.send()
  }catch(e){
    res.status(500).send()
  }
})






module.exports = router