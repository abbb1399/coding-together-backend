const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const fs = require('fs')
const path = require("path");
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

// 로그아웃 하나씩 - 컴/스마트폰/태블릿 ..
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

// 로그아웃 All - 다른기기도 전부 로그아웃
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
  try{
    res.send(req.user)
  }catch(e){
    res.status(500).send()
  }
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

// 계정 삭제하기 - 계정삭제시 미들웨어에서 내가 쓴글도 삭제되도록 처리함
router.delete('/users/me', auth, async (req,res)=>{
  try{
    await req.user.remove()
    res.send(req.user)
  }catch(e){
    res.status(500).send()
  }
})


const storage = multer.diskStorage({
  destination: function(req, file ,callback){
    callback(null, "images/avatars/")
  },
  filename: function(req, file, callback){
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    callback(null, basename + "-" + Date.now() + extension);
  }
});

// 미들웨어 등록
const upload = multer({
  storage: storage
});


// 아바타 업로드
router.post('/avatar', auth, upload.single('avatar') , async (req, res) => {
  
  console.log( req.file.filename)
  req.user.avatar = req.file.filename
  
  await req.user.save()
  res.send()
  
}, (error,req,res,next)=>{
  res.status(400).send({error: error.message})
});


// 아바타 불러오기
router.get('/avatars/:avatar', function (req,res){
  const filename = req.params.avatar

  fs.readFile(`./images/avatars/${filename}`, function(error, data){
    res.writeHead(200, {'Content-Type' : 'image/png'})
    res.end(data)
  })
})

module.exports = router