const express = require('express')
const Coach = require('../models/coach')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/coaches', auth, async (req,res) => {
  const coach = new Coach({
    ...req.body,
    owner: req.user._id
  })

  try{
    await coach.save()
    res.status(201).send(coach)
  }catch(e){
    res.status(400).send(e)
  }
})

router.get('/coach-list', async (req,res)=>{
  try{
    const users = await Coach.find({})
    res.send(users)
  }catch(e){
    res.send(500).send()
  }
})


// GET /coaches?completed=false
// GET /coaches?limit=10&skip=20
// GET /coaches?sortBy=createdAt:desc
router.get('/coaches', auth,  async (req,res) => {
  const match = {}
  const sort = {}

  if(req.query.completed){
    match.completed = req.query.completed === 'true'
  }

  if(req.query.sortBy){
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }


  try{
    await req.user.populate({
      path: 'coaches',
      match,
      options:{
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null,
        sort
      }
    })
    // console.log(req.user.coaches)
    res.send(req.user.coaches)
  }catch(e){
    res.send(500).send()
  }
})

router.get('/coaches/:id',auth, async (req,res)=>{
  const _id = req.params.id

  try{
    const coach = await Coach.findOne({ _id, owner: req.user._id})

    if(!coach){
      return res.status(404).send()
    }

    res.send(coach)
  }catch(e){
    res.status(500).send()
  }
})

router.patch('/coaches/:id', auth, async (req,res) =>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','areas','description']
  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error: 'Invalid updates!'})
  }

  try{
    const coach = await Coach.findOne({ _id: req.params.id, owner: req.user._id })
    
    if(!coach){
      return res.status(400).send()
    }

    updates.forEach((update)=> coach[update] = req.body[update])
    await coach.save()

    res.send(coach)
  }catch(e){
    res.status(400).send(e)
  }
})

router.delete('/coaches/:id', auth, async (req,res) =>{
  try{
    const coach = await Coach.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if(!coach){
      return res.status(404).send()
    }

    res.send(coach)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router