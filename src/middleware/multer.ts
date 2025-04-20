import multer from 'multer'
import path from 'path'

const { FILESTORAGE_PATH = '' } = process.env

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILESTORAGE_PATH)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

export default upload
