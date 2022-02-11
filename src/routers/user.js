const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

// 회원가입
router.post('/users', async (req,res)=>{
  const user = new User(req.body)

  try{
    await user.save()
    // 토큰 생성
    const token = await user.generateAuthToken()
    res.status(201).send({user, token})
  }catch(e){
    res.status(400).send(e)
  }
})

// 로그인
router.post('/users/login', async (req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password)
    // 토큰 생성
    const token = await user.generateAuthToken()
    res.send({user, token})
  }catch(e){
    res.status(400).send()
  }
})

// 로그아웃
router.post('/users/logout', auth, async (req,res) =>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !== req.token
    })
    
    await req.user.save()

    res.send()
  }catch(e){  
    res.status(500).send()
  }
})

// 로그아웃 all - 다른기기도 전부 로그아웃
router.post('/users/logoutAll', auth, async (req,res)=>{
  try{
    req.user.tokens = []
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})

//모든 유저 정보 불러오기
router.get('/users/usersList', async (req, res) => {
  try{
    const users = await User.find( {} )
    // console.log(users)
    
    if(!users){
      return res.status(404).send()
    }

    res.send(users)
  }catch(e){
    res.status(500).send()
  }
})


// 내 프로필 보기
router.get('/users/me',auth, async (req,res)=>{
  res.send(req.user)
})


// 업데이트하기
router.patch('/users/me', auth, async (req,res)=>{
  // 없는 property가 입력되면
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','email','password','age']
  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error: 'Invalid Updates!'})
  }

  try{
    updates.forEach((update)=>  req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  }catch(e){
    res.status(400).send(e)
  }
})

// 삭제하기
router.delete('/users/me', auth, async (req,res)=>{
  try{
    await req.user.remove()
    
    res.send(req.user)
  }catch(e){
    res.status(500).send()
  }
})

// Multer 업로드
const upload = multer({
  // dest:'images',
  limits:{
    // 5메가 제한
    fileSize: 5000000
  },
  fileFilter(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('jpg/jpeg/png 파일만 업로드 해주세요.'))
    }
    cb(undefined, true)
  }
})


// 아바타 업로드
router.post('/users/me/avatar', auth , upload.single('avatar') , async (req,res)=>{
  // sharp로 이미지 가공
  const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()

  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error,req,res,next) => {
  res.status(400).send({ error : error.message })
})



// 아바타 삭제
router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req,res) =>{
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

// 아바타 불러오기
router.get('/users/:id/avatar', async (req,res) =>{
  try{
    const user = await User.findById(req.params.id)

    // if(!user || !user.avatar){
    if(!user || !user.avatar){
      throw new Error()
    }
    
    // respone-header 세팅
    res.set('Content-Type','image/png')
    
    res.send(user.avatar)
  }catch(e){
    res.status(404).send()
  }
})

module.exports = router