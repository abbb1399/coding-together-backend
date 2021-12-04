require('../src/db/mongoose')
const Coach = require('../src/models/coach')

// 1.Promise Chaining방법
// Coach.findByIdAndDelete('6172c67474e4c404da2f8376').then((coach)=>{
//   console.log(coach)
//   return Coach.countDocuments({ description: '설명 없음'})
// }).then((result)=>{
//   console.log(result)
// }).catch((e)=>{
//   console.log(e)
// })

// 2.Async/Await 방법
const deleteCoachAndCount = async (id) =>{
  const coach = await Coach.findByIdAndDelete(id)
  const count = await Coach.countDocuments({description: '설명 없음'})
  return count
}

deleteCoachAndCount('617166f05066c2620f248b20').then((count)=>{
  console.log(count)
}).catch((e)=>{
  console.log(e)
})