'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

module.exports = app => {
  // create express app:
  const exp = express()

  exp.use(bodyParser.urlencoded({extended: false}))
  exp.use(morgan('dev'))
  exp.use(bodyParser.urlencoded({extended: false}))
  exp.use(bodyParser.json())
  // exp.use((req, res, next) => {
  //   res.header('Access-Control-Allows-Origin', 'Origin, X-Requested-With, Content-Type, Accept')
  //   res.header('Access-Control-Allows-Headers', 'Origin, X-Requested-With, Accept, Authorization')
  //   if (req.method === 'OPTIONS') {
  //     res.header('Access-Control-Allows-Methods', 'PUT, POST, GET, DELETE, PATCH')
  //     return res.status(200).json({})
  //   }
  //   next()
  // })
  // enable cors:
  if (app.config.cors) {
    exp.use(cors())
    app.log.debug('Activated CORS')
  }

  return exp
}
