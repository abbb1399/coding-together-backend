const express = require("express")
const fs = require("fs")
const Article = require("../models/article")
const auth = require("../middleware/auth")
const upload = require('../middleware/upload')
const router = new express.Router()
const sharp = require("sharp")

// 공고 생성
router.post("/articles", auth, async (req, res) => {
  const article = new Article({
    ...req.body,
    owner: req.user._id,
  })

  try {
    await article.save()
    res.status(201).send(article)
  } catch (e) {
    res.status(400).send(e)
  }
})

// 공고 불러오기
router.get("/articles/:page", async (req, res) => {
  const pageNum = parseInt(req.params.page)

  const params = {}
  if (req.query.filter !== "all") {
    params.areas = req.query.filter
  }

  try {
    const articles = await Article.find(params)
      // .populate({ path: "owner", select: "name email" })
      .skip(pageNum)
      .limit(4)
      .sort({ updatedAt: -1 })
    res.send(articles)
  } catch (e) {
    res.status(500).send()
  }
})

// 공고 하나 보기
router.get("/article/:id", async (req, res) => {
  const articleId = req.params.id

  try {
    const article = await Article.findOne({ _id: articleId }).populate({
      path: "owner",
      select: "name",
    })

    if (!article) {
      return res.status(404).send()
    }

    res.send(article)
  } catch (e) {
    res.status(500).send()
  }
})

router.get("/my-article/:page", auth, async (req, res) => {
  const page = parseInt(req.params.page)
  const perPage = 5
  const skipPage =  page === 1 ? 0 : (page - 1) * perPage

  try {
    Article.find({ owner: req.user._id })
      .skip(skipPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec(async (err, articles) => {
        if (err) {
          throw Error('에러~~');
        }
        const total = await Article.countDocuments({owner: req.user._id})
    
        res.send( {articles, total })
      })

  } catch (e) {
    res.status(500).send()
  }
})

// 내가 쓴 공고 하나(디테일) 보기
router.get("/my-article-detail/:id", auth, async (req, res) => {
  const articleId = req.params.id

  const article = await Article.findOne({ owner: req.user._id, _id: articleId })

  try {
    res.send(article)
  } catch (e) {
    res.status(500).send()
  }
})

// 공고 업데이트
router.patch("/articles/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["name", "areas", "description", "thumbnail"]
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({ error: "업데이트 요소가 아닙니다.!" })
  }

  try {
    // 글쓴이가 나일때만 업데이트
    const article = await Article.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })

    if (!article) {
      return res.status(404).send()
    }

    updates.forEach((update) => (article[update] = req.body[update]))
    await article.save()

    res.send(article)
  } catch (e) {
    res.status(400).send(e)
  }
})

// 내글 공고 삭제
router.delete("/article/:id", auth, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({
      owner: req.user._id,
      _id: req.params.id,
    })

    if (!article) {
      res.status(404).send()
    }

    res.send(article)
  } catch (e) {
    res.status(500).send()
  }
})


// 이미지 업로드
router.post("/images/:type", upload.single("images"), async (req, res) => {
  const { path, destination, filename } = req.file
  const type = req.params.type
    
  // if(type === 'thumbnail'){
  //   sharp(path).resize({ fit: "fill", width: 696, height: 512 })
  // }

  sharp(path)
    .png()
    .toFile(`${destination}re-${filename}`, (error, info) => {
      if (error) {
        throw new Error("이미지 업로드 실패")
      }

      fs.unlink(destination + filename, (error) => {
        if (error) {
          throw new Error("원본파일 삭제 실패")
        }
      })
      res.send("re-" + filename)
    })
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message })
  }
)

// 이미지 불러오기
router.get("/images/:filename", (req, res) => {
  const filename = req.params.filename

  fs.readFile(`./images/${filename}`, (error, data) => {
    res.writeHead(200, { "Content-Type": "image/png" })
    res.end(data)
  })
})

module.exports = router
