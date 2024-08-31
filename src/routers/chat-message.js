const express = require("express");
const ChatMessage = require("../models/chat-message");
// const auth = require('../middleware/auth')
const router = new express.Router();

// 해당방 메세지 모두 불러오기
router.get("/chat-messages/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const chatMessage = await ChatMessage.find({ roomId });

    if (!chatMessage) {
      return res.status(404).send();
    }

    res.send(chatMessage);
  } catch (e) {
    res.status(500).send();
  }
});

// 메세지 생성하기
router.post("/chat-messages", async (req, res) => {
  const chatMessage = new ChatMessage({
    ...req.body,
  });

  try {
    await chatMessage.save();
    res.status(201).send(chatMessage);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 메세지 삭제하기
router.patch("/delete-message/:msgId", async (req, res) => {
  try {
    const message = await ChatMessage.findOneAndUpdate(
      { _id: req.params.msgId },
      { deleted: true },
    );

    if (!message) {
      res.status(404).send();
    }

    res.send(message);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 메세지 수정하기
router.patch("/update-message", async (req, res) => {
  const { msgId, content, edited } = req.body;

  try {
    await ChatMessage.findOneAndUpdate({ _id: msgId }, { content, edited });
    res.send();
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
