'use strict'

module.exports = app =>
  class NotFoundError extends Error {
    constructor(message, details) {
      super(message)

      this.name = 'NotFoundError'
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
      if (err.name === 'NotFoundError') {
        return res.status(404).json({
          // generic human readable explaining message
          message: 'Not Found.',

          // details as of https://jsonapi.org/format/#error-objects
          errors: [
            {
              status: 404,
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
