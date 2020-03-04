'use strict'

module.exports = app => {
  let stack = {}

  /**
   * export err to stack
   */
  app.express.use((err, req, res, next) => {
    stack = err
    next(err)
  })

  /**
   * and yes, just render 404 on any unrouted url
   */
  app.express.use((req, res) =>
    res.status(404).json({
      // generic human readable explaining message
      message: 'Wrong URL the page is Not Found.!!',

      // details as of https://jsonapi.org/format/#error-objects
      errors: [
        {
          status: 404,
          detail: `${req.method} ${req.url}`
        }
      ]
    })
  )

  /**
   * and I catch all errors, in order!
   */
  app.express.use(app.errors.SchemaValidationError.handleError)
  app.express.use(app.errors.ValidationError.handleError)
  app.express.use(app.errors.BadRequestError.handleError)
  app.express.use(app.errors.NotFoundError.handleError)

  /**
   * finally catch all uncought exceptions
   */
  app.express.use((err, req, res, next) => {
    app.log.error(`${err.name}: ${err.message}`)
    app.log.debug(err.stack)

    if (res.headersSent) return next(err)

    return res.status(500).json({
      // generic human readable explaining message
      message: 'Server Error.',

      // details as of https://jsonapi.org/format/#error-objects
      errors: [
        {
          status: 500,
          title: err.name,
          detail: err.message
        }
      ]
    })
  })

  return stack
}
