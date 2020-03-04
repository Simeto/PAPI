'use strict'

const multer = require('multer')

module.exports = app => {
  return {
    image () {
      return multer({
        limits: {
          fileSize: 1000000
        },
        fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload a jpg, jpeg or png image format !'))
          }
          cb(undefined, true)
        }
      })
    },
    files () {
      return multer({
        limits: {
          fileSize: 1000000
        },
        fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(doc|docx)$/)) {
            cb(new Error('Please upload a doc or dox file format !'))
          }
          cb(undefined, true)
        }
      })
    }
  }
}
