'use strict'

const nodemailer = require('nodemailer')

module.exports = app => {
  const transporter = nodemailer.createTransport({
    host: app.config.nmhost,
    port: app.config.nmport,
    auth: {
      user: app.config.nmuser,
      pass: app.config.nmpass
    }
  },
  {
    from: 'Mailer test "<app.config.nmuser>"'
  })
  const mailer = message => {
    transporter.sendMail(message, (err, info) => {
      if (err) return console.log(err)
      console.log('Email send: ', info)
    })
  }

  return mailer
}
