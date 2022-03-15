const mongoose = require("mongoose")

const kanbanSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
    trim:true
  },
  list:{
    type:Array,
    // required:true
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  dueDate:{
    type:Date
  },
},{
  timestamps: true
})

const Kanban = mongoose.model('Kanban', kanbanSchema)

module.exports = Kanban