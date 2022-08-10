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
    const kanbans = await Kanban.find({ owner: req.user._id }).sort({
      order: 1,
    })
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

// Kanban Board 순서 변경
router.patch("/move-kanban", auth, async (req, res) => {
  const { boardId, newIndex, oldIndex } = req.body

  try {
    // 1. 기준값(oldIndex)를 잠시 -1로 빼둠
    await Kanban.findOneAndUpdate({owner: req.user._id ,order: oldIndex}, {order:-1})
    
    // 2-1. 한칸식 이동할때
    if (Math.abs(newIndex - oldIndex) === 1) {
      await Kanban.findOneAndUpdate({owner: req.user._id,order: newIndex }, { order: oldIndex })
    
    // 2-2. 오른쪽/왼쪽으로 땡길지에 따라, 기준값을 기준삼아 위/아래로 +-/1 for문을 돌려준다.
    } else {
      const boardArray = []
      
      // to the right
      if(newIndex >= oldIndex){
        for (let index = newIndex; index > oldIndex ; index--) {
          const board = await Kanban.findOne({owner: req.user._id, order: index})
          boardArray.push({id:board._id, order: index-1})
        }
      // to the left
      }else{
        for (let index = newIndex; index < oldIndex ; index++) {
          const board = await Kanban.findOne({owner: req.user._id , order: index})
          boardArray.push({id:board._id, order: index+1})
        }
      }
      boardArray.forEach(async (el)=>{
        await Kanban.findOneAndUpdate({_id:el.id}, {order:el.order})
      })
    }
    //3. 새로 들어온 값~
    await Kanban.findOneAndUpdate({_id:boardId}, {order:newIndex})
    
    res.send()
  } catch (e) {
    console.log(e)
  }
}) 

// Kanban board 삭제
router.delete("/kanban/:id", auth, async (req, res) => {
  try {
    const kanban = await Kanban.findOneAndDelete({
      owner: req.user._id,
      _id: req.params.id,
    })

    if (!kanban) {
      res.status(404).send()
    }

    res.send(kanban)
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
  const { status, boardId, task, newIndex } = req.body

  let listData
  if(task.dueDate){
    listData = { id: task.id, name: task.name, dueDate: task.dueDate }
  }else{
    listData = { id: task.id, name: task.name }
  }
  
  try {
    if (status === "added") {
      await Kanban.findOneAndUpdate(
        { _id: boardId },
        {
          $push: {
            list: {
              $each: [listData],
              $position: newIndex,
            },
          },
        }
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
  const { status, boardId, taskId, taskName, dueDate } = req.body

  let searchConditon

  if (status === "NAME") {
    searchConditon = { $set: { "list.$[el].name": taskName } }
  } else if (status === "DATE") {
    searchConditon = { $set: { "list.$[el].dueDate": dueDate } }
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

// Task 삭제
router.delete("/delete-task", async (req, res) => {
  const {boardId, taskId} = req.body

  try {
    const kanban = await Kanban.findOne({_id: boardId})

    if (!kanban) {
      res.status(404).send()
    }
    
    const taskIndex = kanban.list.findIndex((list) => list.id === taskId)
    kanban.list.splice(taskIndex,1)

    await kanban.save()
    res.send(kanban)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
