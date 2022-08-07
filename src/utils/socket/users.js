const users = []

const addUser = ({ id, username, room, userId, roomId})=>{
  // 데이터 가다듬기
  username = username.trim().toLowerCase()
  // room = room.trim().toLowerCase()
  room = room.trim()

  // 데이터 검증
  if(!username || !room || !roomId){
    return {
      error: '정보가 필요 합니다.'
    }
  }

  // 해당 유저가 이미 방에 들어와 있는지 확인 
  const exitingUser = users.find((user)=>{
    return user.roomId === roomId && user.username === username && user.userId === userId
  })  

  // Validate username
  if(exitingUser){
    return {
      error: '이미 들어와잇습니다?'
    }
  }

  // 유저 저장
  const user = { id,username, room, userId, roomId }
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