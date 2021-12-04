const express = require('express')
const Request = require('../models/request')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/requests', async (req, res) =>{

  const request = new Request({
    ...req.body
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

router.get('/requests/:id', async (req,res)=>{
  const _id = req.params.id

  try{
    const request = await Request.findOne({_id, owner: req.user._id})
    

    if(!request){
      return res.status(404).send()
    }

    res.send(coach)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router