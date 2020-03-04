'use strict'

const express = require('express')

module.exports = app => {
  const router = express.Router()

  // With `call`, can wrap a route handler into a promise to forward any exceptions to an error handler:
  const call = fn => (...args) => fn(...args).catch(args[2])

  /**
   * bind to application, base '/' is default
   */
  app.express.use(app.config.apiBasePath, router)
  app.express.use('/uploads', express.static('uploads'))
  const USER = app.controllers
  const CHECK = app.middleware
  const upload = CHECK.Multer.image()

  /**
   * ROUTES
   */
  router.post('/register', call(USER.users.registerUser))
  router.post('/login', call(USER.users.loginUser))
  router.post('/logout', call(CHECK.CheckAuth.check), call(USER.users.logoutUser))
  router.post('/logoutAll', call(CHECK.CheckAuth.check), call(USER.users.logoutAll))
  router.put('/updateUserProfile',
    call(CHECK.CheckAuth.check),
    call(USER.users.updateUserProfile))
  router.post('/updateUserAvatar',
    call(CHECK.CheckAuth.check),
    upload.single('image'),
    call(USER.users.updateUserAvatar))
  router.delete('/deleteUserAvatar',
    call(CHECK.CheckAuth.check),
    call(USER.users.deleteUserAvatar))
  router.get('/getUserAvatar',
    call(CHECK.CheckAuth.check),
    call(USER.users.getUserAvatar))
  router.delete('/delete', call(CHECK.CheckAuth.check), call(USER.users.deleteUser))
  router.post('/forgotPassword', call(USER.users.forgotPassword))
  router.get('/redirectToResetPassword/:token', call(CHECK.CheckAuth.check), call(USER.users.redirectToReset))
  router.post('/resetPassword', call(CHECK.CheckAuth.check), call(USER.users.resetPassword))
  router.get('/redirectToPrivacyPolicy/:token', call(CHECK.CheckAuth.check), call(USER.users.redirectPrivacyPolicy))
  router.post('/privacyPolicyConfirmation', call(CHECK.CheckAuth.check), call(USER.users.privacyPolicyConfirmed))
  router.post('/termsConfirmation', call(CHECK.CheckAuth.check), call(USER.users.termsConfirmation))
  router.post('/cookiesConfirmation', call(CHECK.CheckAuth.check), call(USER.users.cookiesConfirmation))

  return router
}
