const express = require("express")
const Kanban = require("../models/kanban")
const router = new express.Router()
const auth = require("../middleware/auth")

// Kanban Board 생성
router.post("/kanbans", auth, async (req, res) => {
  const kanban = new Kanban({
    ...req.body,
    owner: req.user._id,
  })

  try {
    await kanban.save()
    res.status(201).send(kanban)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Kanban Board 불러오기
router.get("/kanbans", auth, async (req, res) => {
  try {
    const kanbans = await Kanban.find({ owner: req.user._id })
    res.send(kanbans)
  } catch (e) {
    res.status(500).send()
  }
})

// Kanban Board 이름 변경
router.patch("/kanbans", auth, async (req, res) => {
  const { boardId, title } = req.body

  try {
    const kanban = await Kanban.findOne({ _id: boardId })

    if (!kanban) {
      return res.status(404).send()
    }

    kanban.title = title
    
    await kanban.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Task 생성
router.patch("/tasks", async (req, res) => {
  const { boardId, id, name } = req.body

  try {
    const kanban = await Kanban.findOne({ _id: boardId })

    if (!kanban) {
      return res.status(404).send()
    }

    kanban.list.push({ id, name })
    await kanban.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Task 이동
router.patch("/move-task", async (req, res) => {
  const { status, boardId, task } = req.body

  try {
    if (status === "added") {
      await Kanban.findOneAndUpdate(
        { _id: boardId },
        { $push: { list: { id: task.id, name: task.name } } }
      )
    } else if (status === "removed") {
      await Kanban.findOneAndUpdate(
        { _id: boardId },
        { $pull: { list: { id: task.id } } }
      )
    }
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Task 이름 변경
router.patch("/update-task", async (req, res) => {
  const { status, boardId, taskId, taskName, taskDate } = req.body

  let searchConditon

  if (status === "NAME") {
    searchConditon = { $set: { "list.$[el].name": taskName } }
  } else if (status === "DATE") {
    searchConditon = { $set: { "list.$[el].date": taskDate } }
  }

  try {
    await Kanban.findOneAndUpdate({ _id: boardId }, searchConditon, {
      arrayFilters: [{ "el.id": taskId }],
      new: true,
    })

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Task 순서 변경
router.patch("/change-task-order", async (req, res) => {
  const { boardId, element, newIndex, oldIndex } = req.body
  try {
    const kanban = await Kanban.findOne({ _id: boardId })

    if (!kanban) {
      return res.status(404).send()
    }

    kanban.list.splice(oldIndex, 1)

    kanban.list.splice(newIndex, 0, element)

    await kanban.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
