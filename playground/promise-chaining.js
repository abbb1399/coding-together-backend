require('../src/db/mongoose')
const User = require('../src/models/user')

// 1.Promise Chaining방법
// User.findByIdAndUpdate('61718fa714da4b3d5c17a88e', {age: 1}).then((user)=>{
//   console.log(user)
//   // promise chaining
//   return User.countDocuments({ age : 1})
// }).then((result) => {
//   console.log(result)
// }).catch((e)=>{
//   console.log(e)
// })


// 2.Async/Await 방법
const updateAgeAndCount = async (id, age) => {
  const user = await User.findByIdAndUpdate(id,{age})
  const count = await User.countDocuments({age})
  return count
}

updateAgeAndCount('61718fa714da4b3d5c17a88e',2).then((count)=>{
  console.log(count)
}).catch((e)=>{
  console.log(e)
})