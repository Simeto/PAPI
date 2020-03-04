/* eslint no-console: 0 */

'use strict'

const pino = require('pino')

/**
 * app.log.error('this is error');
 * app.log.info('this is info');
 * app.log.debug('this is debug');
 */
module.exports = (app, namespace) => {
  let pretty = null

  // default options
  let options = {
    name: `${namespace || app.name} ${process.env.NODE_APP_INSTANCE} (${
      app.version
    })`,
    level: app.config.loglevel || 'debug',
    enabled: app.config.logEnabled
  }

  // when run as cli
  if (app.config.cliMode || app.config.logPretty) {
    pretty = pino.pretty()
    pretty.pipe(process.stdout)
    options = {
      name: `${namespace || app.name}`,
      level: app.config.loglevel || 'debug',
      enabled: app.config.logEnabled,
      base: null
    }
  }

  const logger = pino(options, pretty)

  if (!app.config.cliMode) {
    logger.fatal('fatal logging is [ON]')
    logger.error('error logging is [ON]')
    logger.warn('warn logging is [ON]')
    logger.info('info logging is [ON]')
    logger.debug('debug logging is [ON]')
    logger.trace('trace logging is [ON]')
  }

  return logger
}
