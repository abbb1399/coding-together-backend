const multer = require('multer')
const path = require("path")

const storage = multer.diskStorage({
  destination: function(req, file ,callback){
    if(file.fieldname === 'avatar'){
      callback(null, "images/avatars/")
    }else if(file.fieldname === 'images'){
      callback(null, "images/")
    }
  },
  filename: function(req, file, callback){
    const extension = path.extname(file.originalname)
    const basename = path.basename(file.originalname, extension)
    callback(null, basename + "-" + Date.now() + extension)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    // 5메가 제한
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
      return cb(new Error("jpg/jpeg/png 파일만 업로드 해주세요."))
    }
    cb(undefined, true)
  }
})

module.exports = upload