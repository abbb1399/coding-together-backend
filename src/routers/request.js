const express = require('express')
const Request = require('../models/request')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/requests', async (req, res) =>{

  const request = new Request({
    ...req.body,
  })

  try{
    await request.save()
    res.status(201).send(request)
  }catch(e){
    res.status(400).send(e)
  }
})

router.get('/requests', async (req,res) =>{
  try{
    const requests = await Request.find({})
    res.send(requests)
  }catch(e){
    res.status(500).send(e)
  }
})

router.get('/requests/:userId', async (req,res)=>{
  const userId = req.params.userId
  console.log(userId)

  try{
    const request = await Request.find({coachId : userId})
    // console.log(request)

    if(!request){
      return res.status(404).send()
    }

    res.send(request)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router