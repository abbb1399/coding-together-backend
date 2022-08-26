const mongoose = require('mongoose')
const validator = require('validator')
const bycript = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Article = require('./article')
const Kanban = require('./kanban')

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: false,
    trim: true
  },
  email:{
    type:String,
    unique:true,
    required:true,
    trim:true,
    lowercase:true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('이메일이 아닙니다.')
      }
    }
  },
  password:{
    type:String,
    required:true,
    minlength: 6,
    trim:true,
    validate(value){
      if(value.toLowerCase().includes('password')){
        throw new Error('password 포함하지마셈')
      }
    }
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  avatar:{
    type: String
  }
},{ 
  timestamps: true
})

// virtual property with Article
// userSchema.virtual('articles', {
//   ref: 'Article',
//   localField: '_id',
//   foreignField: 'owner'
// })

// user에서 불필요한 정보제거하는 함수 - toJSON은 해당 object가 JSON.stringfy 일때마다 실행됨
userSchema.methods.toJSON = function(){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  // delete userObject.avatar

  return userObject
}

// Auth 토큰 생성, instance에서 접근가능 (instance method) user
userSchema.methods.generateAuthToken = async function(){
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}


// 아이디/비밀번호 체크(bycript), static method는 model에서 접근가능 (model method) User
userSchema.statics.findByCredentials = async (email, password) =>{
  const user = await User.findOne({ email })

  if(!user){
    throw new Error('존재하지 않는 이메일입니다.')
  }

  // user.password는 hashedpassword
  const isMatched = await bycript.compare(password, user.password)

  if(!isMatched){
    throw new Error('비밀번호가 틀립니다.')
  }

  return user
}

// 비밀번호 암호화 미들웨어 - hash plan text password before saving
userSchema.pre('save', async function(next){
  // this는 save될 document를 가르킨다.
  const user = this

  if(user.isModified('password')){
    // plain password를 해쉬된 password로 overried함
    user.password = await bycript.hash(user.password, 8)
  }

  next()
})

// 계정 탈퇴시 내가 쓴 공고/칸반 들도 삭제 하기
userSchema.pre('remove', async function (next) {
  const user = this
  await Article.deleteMany({ owner: user._id})
  await Kanban.deleteMany({ owner: user._id})
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User