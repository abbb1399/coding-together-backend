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
router.get('/requests', auth, async (req,res)=>{
  // console.log(req.user._id)

  try{
    const requests = await Request.find({owner : req.user._id}).populate('owner').populate('userId')

    res.send(requests)
  }catch(e){
    res.status(500).send()
  }
})

// 받은 요청 읽음 표시
router.patch("/requests/:id", async (req, res) => {
  
  try {
    const request = await Request.findOne({
      _id: req.params.id,
    })

    if (!request) {
      return res.status(404).send()
    }

    request.isRead = true
    await request.save()

    res.send()
  } catch (e) {
    res.status(400).send(e)
  }
})


module.exports = router