const express = require('express')
const Request = require('../models/request')
const auth = require('../middleware/auth')
const router = new express.Router()

// 요청 등록
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


// 받은 요청 불러오기
router.get('/requests/:ownerId', auth, async (req,res)=>{
  const ownerId = req.params.ownerId

  try{
    const request = await Request.find({coachId : ownerId}).populate('owner')

    if(!request){
      return res.status(404).send()
    }

    res.send(request)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router