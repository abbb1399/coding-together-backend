const express = require('express')
const Schedule = require('../models/schedule')
const auth = require('../middleware/auth')
const router = new express.Router()

// 일정 생성
router.post('/schedules', auth, async(req,res) => {
  console.log(req.body)
  console.log(req.user._id)

  
  const schedule = new Schedule({
    ...req.body,
    owner: req.user._id
  })

  try{
    await schedule.save()
    res.status(201).send(schedule)
  }catch(e){
    res.status(400).send(e)
  }
})

// 내 일정 보기
router.get('/schedules',auth, async(req,res) => {
  try{
    const schedule = await Schedule.find({owner: req.user._id})
    res.send(schedule)
  }catch(e){
    res.status(500).send()
  }
})

// 내 일정 수정
router.patch('/schedules/:id',auth, async(req,res) => {
  const updates = Object.keys(req.body)
  console.log(updates)
  
  const allowedUpdates = ['calendarId','title','location','category','start','end']
  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error: '유효한 업데이트가 아닙니다.'})
  }

  try{
    const schedule = await Schedule.findOne({ id: req.params.id, owner: req.user._id })
    
    if(!schedule){
      return res.status(404).send()
    }

    updates.forEach((update)=> schedule[update] = req.body[update])
    await schedule.save()

    res.send(schedule)
  }catch(e){
    res.status(400).send(e)
  }
})

// 내 일정 삭제
router.delete('/schedules/:calendarId/:id',auth, async(req,res) => {
  const {calendarId, id} = req.params

  try{
    const schedule = await Schedule.findOneAndDelete(
      { calendarId, id, owner: req.user._id}
    )
    if(!schedule){
      res.status(404).send()
    }

    res.send(schedule)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router