const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 1. 올바른 아이디를 가지고 유저를 찾고
    // 2. 토큰이 여전히 tokens array안에 속하는지(로그아웃하면 지우기때문에)
    const user = await User.findOne({
      "_id": decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "인증을 해주세요!!" });
  }
};

module.exports = auth;
