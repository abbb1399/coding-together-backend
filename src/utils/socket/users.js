const users = []

const addUser = ({ id, username, room, date, email, userId})=>{
  // 데이터 lowercase
  
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if(!username || !room ){
    return {
      error: 'Username and room are required!'
    }
  }

  // 해당 유저가 이미 방에 들어와 있는지 확인 
  const exitingUser = users.find((user)=>{
    return user.room === room && user.username === username && user.userId === userId
  })  

  // Validate username
  if(exitingUser){
    return {
      error: '이미 들어와잇습니다 ??'
    }
  }

  // 유저 저장
  const user = { id,username, room, date, email, userId }
  users.push(user)
  
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user)=> user.id === id)

  if(index !== -1){
    return users.splice(index, 1)[0]
  }
}


const getUser = (id) =>{
  return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) =>{
  room = room.trim().toLowerCase()
  return users.filter((user)=> user.room === room )
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}