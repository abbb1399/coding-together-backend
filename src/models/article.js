const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    name: {
      type:String,
      required:true,
      trim:true
    },
    areas:{
      type:Array,
      required:true
    },
    description:{
      type:String,
      required:true
      // default:'설명 없음'
    },
    completed:{
      type: Boolean,
      default: false
    },
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    thumbnail:{
      type: String
    }
},{
  timestamps: true
})

const Article = mongoose.model('Article',articleSchema)

module.exports = Article