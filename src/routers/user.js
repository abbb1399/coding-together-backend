const express = require("express");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const fs = require("fs");
const router = new express.Router();
const { sendWelcomeEmail, sendNewPasswordEmail } = require("../email/aws-ses");
const { generatePassword } = require("../utils/password/generate-password");

// 회원가입
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    // 회원가입 이메일
    sendWelcomeEmail(user.email, user.name);
    // 토큰 생성
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send("중복되는 이메일입니다.");
  }
});

// 로그인
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
    );
    // 토큰 생성
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send("유효한 아이디/비밀번호를 입력해주세요.");
  }
});

// 로그아웃 하나씩 - 컴/스마트폰/태블릿 ..
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// 로그아웃 All - 다른기기도 전부 로그아웃
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// 업데이트하기
// router.patch('/users/me', auth, async (req,res)=>{
//   // 없는 property가 입력되면
//   const updates = Object.keys(req.body)
//   const allowedUpdates = ['name','email','password']
//   const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

//   if(!isValidOperation){
//     return res.status(400).send({error: 'Invalid Updates!'})
//   }

//   try{
//     updates.forEach((update)=>  req.user[update] = req.body[update])
//     await req.user.save()
//     res.send(req.user)
//   }catch(e){
//     res.status(400).send(e)
//   }
// })

// 비밀번호 변경
router.patch("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByCredentials(req.user.email, oldPassword);

    // User 미들웨어에서 저장되기전에 암호화 처리함
    user.password = newPassword;
    await user.save();
    res.send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// 비밀번호 찾기
router.patch("/find-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    const newPassword = generatePassword();

    // User 미들웨어에서 저장되기전에 암호화 처리함
    user.password = newPassword;
    await user.save();

    // 회원에게 바뀐 이메일 보내기
    sendNewPasswordEmail(email, newPassword);
    res.send();
  } catch (e) {
    res.status(400).send(e);
  }
});

// 계정 삭제하기 - 계정삭제시 미들웨어에서 내가 쓴글도 삭제되도록 처리함
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// 아바타 업로드
router.post(
  "/avatar",
  auth,
  upload.single("avatar"),
  (req, res) => {
    const { path, destination, filename } = req.file;

    sharp(path)
      .resize({ fit: "fill", width: 150, height: 150 })
      .png()
      .toFile(`${destination}av-${filename}`, async (error, info) => {
        if (error) {
          throw new Error("이미지 업로드 실패");
        }

        fs.unlink(destination + filename, (error) => {
          if (error) {
            throw new Error("원본파일 삭제 실패");
          }
        });
        const reFilename = "av-" + filename;

        // user.avatar에 입력해주기
        req.user.avatar = reFilename;
        await req.user.save();
        res.send(reFilename);
      });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  },
);

// 아바타 불러오기
router.get("/avatars/:avatar", (req, res) => {
  const filename = req.params.avatar;

  fs.readFile(`./images/avatars/${filename}`, (error, data) => {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(data);
  });
});

// 내가 입장한 채팅방
router.post("/in-chat-room", auth, async (req, res) => {
  const { articleId, chatRoomId } = req.body;

  try {
    const user = await User.findOne({ email: req.user.email });

    user.inChatRoom.push({ articleId, chatRoomId });

    await user.save();
    res.send({ articleId, chatRoomId });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
