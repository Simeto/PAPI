'use strict'

module.exports = app =>
  class BadRequestError extends Error {
    constructor(message, details) {
      super(message)

      this.name = 'BadRequestError'
      this.message = message
      this.details = details
    }

    /**
     * handle error in app.use
     * @param  {Class}   err  Instance of thrown error get's passed from dispatcher
     * @param  {Object}   req  express' request object
     * @param  {Object}   res  express' resonse object
     * @param  {Function} next express' next() function
     */
    static handleError(err, req, res, next) {
      /**
       * handle validation errors
       */
      if (err.name === 'Bad RequestError') {
        return res.status(400).json({
          // generic human readable explaining message
          message: 'Bad Request.',

          // details as of https://jsonapi.org/format/#error-objects
          errors: [
            {
              status: 400,
              title: err.name,
              detail: err.message,
              meta: err.details
            }
          ]
        })
      }

      return next(err)
    }
  }
