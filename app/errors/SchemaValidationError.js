'use strict'

module.exports = app =>
  class SchemaValidationError extends Error {
    constructor(e) {
      super(e)
      this.name = 'SchemaValidationError'
      this.message = 'Failed to validate request data'
      this.errors = e
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
      if (err.name === 'SchemaValidationError') {
        app.log.warn(
          `${err.name}: ${err.message} ( ${JSON.stringify(err.errors)} )`
        )

        return res.status(400).json({
          // generic human readable explaining message
          message: 'Invalid Data: Unable to process request.',

          // details as of https://jsonapi.org/format/#error-objects
          errors: [
            {
              status: 400,
              title: err.name,
              detail: err.message,
              meta: err.errors
            }
          ]
        })
      }

      return next(err)
    }
  }
