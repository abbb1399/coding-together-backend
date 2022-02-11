const express = require('express')
const fs = require('fs')
const path = require("path");

const Coach = require('../models/coach')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')


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

// 코치리스트 불러오기
router.get('/coach-list', async (req,res)=>{
  try{
    const coaches = await Coach.find()
    
    res.send(coaches)
  }catch(e){
    res.send(500).send()
  }
})

// 코치리스트 paginiation
router.get('/more-coach-list/:page', async (req,res)=>{
  const pageNum = parseInt(req.params.page)
  
  const params = {}
  if(req.query.filter !== 'all'){
    params.areas = req.query.filter
  }

  try{
    const coaches = await Coach.find(params).skip(pageNum).limit(2).sort({updatedAt: -1})
    // console.log(coaches)
    res.send(coaches)
  }catch(e){
    res.send(500).send()
  }
})


// 코치리스트 테스트
router.get('/test', async (req,res)=>{
  console.log(req.query.areas)
  const areas = {
    areas: req.query.areas
  }
  console.log(areas)

  try{
    const coaches = await Coach.find({})
    
    res.send(coaches)
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


// Multer 업로드
// const upload = multer({
//   dest:'images',
//   limits:{
//     // 5메가 제한
//     fileSize: 5000000
//   },
//   fileFilter(req, file, cb){
//     if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
//       return cb(new Error('jpg/jpeg/png 파일만 업로드 해주세요.'))
//     }
//     cb(undefined, true)
//   }
// })

let storage = multer.diskStorage({
  destination: function(req, file ,callback){
      callback(null, "images/")
  },
  filename: function(req, file, callback){
      let extension = path.extname(file.originalname);
      let basename = path.basename(file.originalname, extension);
      callback(null, basename + "-" + Date.now() + extension);
  }
});

// 1. 미들웨어 등록
let upload = multer({
  storage: storage
});


// 이미지 업로드
router.post('/images', upload.single('images') ,(req, res) => {
  console.log(req.file.originalname)
  console.log(req.file.filename)
  // 디비에 파일네임 저장해


  res.send()
}, (error,req,res,next)=>{
  res.status(400).send({error: error.message})
});


// 이미지 불러오기
router.get('/images', function (req,res){
  fs.readFile('./images/d4ff538c3c0a2778016c5769de866785.png', function(error, data){
    res.writeHead(200, {'Content-Type' : 'image/png'})
    res.end(data)
  })
})

module.exports = router