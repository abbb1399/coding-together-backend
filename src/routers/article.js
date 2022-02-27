const express = require('express')
const fs = require('fs')
const path = require("path");

const Article = require('../models/article')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')

// 공고 생성
router.post('/articles', auth, async (req,res) => {
  const article = new Article({
    ...req.body,
    owner: req.user._id
  })

  try{
    await article.save()
    res.status(201).send(article)
  }catch(e){
    res.status(400).send(e)
  }
})

// 공고 불러오기
router.get('/article-list', async (req,res)=>{
  try{
    const articles = await Article.find()
    
    res.send(articles)
  }catch(e){
    res.send(500).send()
  }
})

// 공고 paginiation
router.get('/more-article-list/:page', async (req,res)=>{
  const pageNum = parseInt(req.params.page)
  
  const params = {}
  if(req.query.filter !== 'all'){
    params.areas = req.query.filter
  }

  try{
    const articles = await Article.find(params).skip(pageNum).limit(4).sort({updatedAt: -1})
    res.send(articles)
  }catch(e){
    res.send(500).send()
  }
})

// 내 공고 보기
router.get('/my-article', auth, async(req,res)=>{
  const article = await Article.findOne({owner: req.user._id})
  
  try{
    res.send(article)
  }catch(e){
    res.send(500).send()
  }
})


// 공고리스트 테스트
router.get('/test', async (req,res)=>{
  const areas = {
    areas: req.query.areas
  }
 
  try{
    const articles = await Article.find({})
    
    res.send(articles)
  }catch(e){
    res.send(500).send()
  }
})


// GET /articles?completed=false
// GET /articles?limit=10&skip=20
// GET /articles?sortBy=createdAt:desc
router.get('/articles', auth,  async (req,res) => {
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
    // const articles = await Article.find({owner: req.user._id})
    await req.user.populate({
      path: 'articles',
      match,
      options:{
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null,
        sort
      }
    })

    res.send(req.user.articles)
  }catch(e){
    res.send(500).send()
  }
})

// 공고 id로 찾기
router.get('/articles/:id',auth, async (req,res)=>{
  const _id = req.params.id

  try{
    // 글쓴이가 나일 경우만
    const article = await Article.findOne({ _id, owner: req.user._id})

    if(!article){
      return res.status(404).send()
    }

    res.send(article)
  }catch(e){
    res.status(500).send()
  }
})

// 공고 업데이트
router.patch('/articles/:id', auth, async (req,res) =>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','areas','description','thumbnail']
  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error: '업데이트 요소가 아닙니다.!'})
  }

  try{
    // 글쓴이가 나일때만 업데이트
    const article = await Article.findOne({ _id: req.params.id, owner: req.user._id })
    console.log(article)

    if(!article){
      return res.status(404).send()
    }

    updates.forEach((update)=> article[update] = req.body[update])
    await article.save()

    res.send(article)
  }catch(e){
    res.status(400).send(e)
  }
})


// 내글 공고 삭제
// '/article/:id'로 변경해야할듯 글선택 삭제로
router.delete('/article', auth, async (req,res) =>{
  try{
    // _id:req.params.id
    const article = await Article.findOneAndDelete({ owner: req.user._id })

    if(!article){
      res.status(404).send()
    }

    res.send(article)
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

const storage = multer.diskStorage({
  destination: function(req, file ,callback){
    callback(null, "images/")
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


// 이미지 업로드
router.post('/images', upload.single('images') ,(req, res) => {
  res.send(req.file.filename)
}, (error,req,res,next)=>{
  res.status(400).send({error: error.message})
});


// 이미지 불러오기
router.get('/images/:filename', function (req,res){
  const filename = req.params.filename

  fs.readFile(`./images/${filename}`, function(error, data){
    res.writeHead(200, {'Content-Type' : 'image/png'})
    res.end(data)
  })
})

module.exports = router