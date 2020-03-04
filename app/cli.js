'use strict'

/**
 * I will require modules from here
 */
require('app-module-path').addPath(__dirname)

const cli = require('commander')
const config = require('lib/config')
const log = require('lib/log')
const loader = require('lib/loader')
const mongoose = require('lib/mongoose')

/**
 * I read in package details
 */
const packageJson = require('../package')

/**
 * I am the app
 */
const app = {
  name: packageJson.name,
  version: packageJson.version,
  cli
}

/**
 * I run in directory
 */
app.root = __dirname

/**
 * I got a config
 */
app.config = config('config')

/**
 * disable logging in cli mode
 * @type {Boolean}
 */
app.config.logEnabled = true

/**
 * supress startup logging in cli mode
 * @type {Boolean}
 */
app.config.cliMode = true

/**
 * I can log
 */
app.log = log(app, 'cli')

/**
 * I am connected to mongodb
 */
app.mongoose = mongoose(app)

/**
 * I may have models
 */
app.models = loader(app, 'models')

/**
 * track a version
 */
app.cli.version(app.version)

/**
 * load and initialize commands
 */
app.commands = loader(app, 'commands')

/**
 * parse args at the end
 */
app.cli.parse(process.argv)

/**
 * output help as default
 */
if (!process.argv.slice(2).length) {
  cli.help()
}
