'use strict'
const validator = require('validator')

module.exports = (app) => {
  const tokensSchema = new app.mongoose.Schema({
    token: {
      type: String,
      createAt: {
        type: Date,
        default: Date.now(),
        index: { expires: 30 }
      },
      validate(value) {
        if (!validator.isJWT(value)) {
          throw new Error('Not correct JWT token')
        }
      }
    }
  }, {timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }})
  return tokensSchema
}
