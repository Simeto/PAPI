'use strict'

const JWT = require('jsonwebtoken')

module.exports = app => {
  return {
    async check(req, res, next) {
      try {
        let token = ''
        if (req.params.token) {
          token = req.params.token
        } else {
          token = req.headers.authorization.replace('Bearer ', '')
        }
        JWT.verify(token, app.config.JWT_KEY, async function(err, decodedToken) {
          if (err) console.log(err)
          else {
            const user = await app.models.User.findByIdAndJWT(decodedToken._id, token)
            if (!user) {
              throw new Error()
            }
            req.token = token
            req.user = user

            next()
          }
        })
      } catch (err) {
        return res.status(401).json({
          message: 'Auth Failed'
        })
      }
    }
  }
}
