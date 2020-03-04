'use strict'

const http = require('http')
const fs = require('fs')

/**
 * running express with a dedicated http server
 * will become usfull in clusterd deployments
 * and for example to server socket.io request
 * in parallel with express application
 */

module.exports = app => {
  const httpServer = http.Server(app.express)

  httpServer.listen(app.config.port, () => {
    app.log.info(`please open http://localhost:${app.config.port}`)
    app.log.debug(app.config)
    app.log.info(
      `Node v${process.env.node_version}, NODE_ENV: ${process.env.NODE_ENV}`
    )

    fs.writeFile(`${app.root}/server.pid`, process.pid, err => {
      /* istanbul ignore next */
      if (err) throw err
    })
  })

  return httpServer
}
