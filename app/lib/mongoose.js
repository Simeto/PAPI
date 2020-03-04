'use strict'

const mongoose = require('mongoose')

/**
 * Native promises, @see http://mongoosejs.com/docs/promises.html
 */
mongoose.Promise = global.Promise

module.exports = app => {
  mongoose.set('debug', function(collectionName, method, query, doc, options) {
    app.log.debug(
      `${collectionName}.${method}(${JSON.stringify(query)}, ${JSON.stringify(
        doc
      )})`
    )
  })

  const db = mongoose.connection
  /* istanbul ignore next */
  db.on('error', () => {
    app.log.error(`connection error with mongodb on ${app.config.mongoose}`)
  })

  db.on('open', () => {
    app.log.info(`connected to mongodb on ${app.config.mongoose}`)
  })

  db.on('disconnected', () => {
    app.log.error('Mongoose default connection disconnected')
  })

  mongoose.connect(app.config.mongoose, {
    useNewUrlParser: true,
    useCreateIndex: true
  }).then(
    () => {
      app.log.info('connection to mongodb successfull')
    },
    err => {
      app.log.fatal(err)
    }
  )

  return mongoose
}
