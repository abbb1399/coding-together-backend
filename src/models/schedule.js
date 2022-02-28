const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
  id:{
    type:String,
    required:true
  },
  calendarId:{
    type:String,
    required:true
  },
  title:{
    type:String,
    required:true,
    validate(value){
      if(value.length > 30){
        throw new Error('30자를 넘지 마세요.')
      }
    }
  },
  location:{
    type:String,
    validate(value){
      if(value.length > 30){
        throw new Error('30자를 넘지 마세요.')
      }
    }
  },
  category:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  start:{
    type: Date,
    required:true
  },
  end:{
    type: Date,
    required:true
  },
  isAllDay:{
    type:Boolean,
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
},{
  timestamps: true
})

const Schedule = mongoose.model('Schedule', scheduleSchema)

module.exports = Schedule