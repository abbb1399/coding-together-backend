const express = require("express")
const Request = require("../models/request")
const auth = require("../middleware/auth")
const router = new express.Router()

// 요청 등록
router.post("/requests", async (req, res) => {
  const request = new Request({
    ...req.body,
  })

  try {
    await request.save()
    res.status(201).send(request)
  } catch (e) {
    res.status(400).send(e)
  }
})

// 받은 요청 불러오기
router.get("/requests/:page", auth, (req, res) => {
  const page = parseInt(req.params.page)
  const perPage = 5
  const skipPage = page === 1 ? 0 : (page - 1) * perPage

  try {
    Request.find({ owner: req.user._id })
      .populate("owner userId")
      .skip(skipPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec(async (err, requests) => {
        if (err) {
          throw Error("에러~~")
        }
        const total = await Request.countDocuments({
          owner: req.user._id,
        })

        res.send({ requests, total })
      })
  } catch (e) {
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

// 안읽은 요청 갯수 불러오기
router.get("/unread-requests", auth, async (req, res) => {
  try {
    const unreadRequests = await Request.countDocuments({
      owner: req.user._id,
      isRead: false,
    })

    res.send({ unreadRequests })
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
