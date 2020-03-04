'use strict'
const bcrypt = require('bcrypt')
const shortid = require('shortid')
const jwt = require('jsonwebtoken')
const PasswordValidator = require('password-validator')
const validator = require('validator')
const isPasswordBlacklisted = require('password-blacklist')
const sharp = require('sharp')
const passValidation = new PasswordValidator()
const scryptParameters = 10

module.exports = (app) => {
  const userSchema = app.schemas.UserSchema

  userSchema.virtual('registered').get(function() {
    return !this.preRegistration
  })

  userSchema.statics.generateHashPassword = async function generateHashPassword(pass, repeated) {
    const dataPass = {}
    if (pass && repeated) {
      if (pass === repeated) {
        if (passValidation.validate(pass, { list: true })) {
          await isPasswordBlacklisted(pass).then(async isBlacklisted => {
            if (isBlacklisted) {
              console.log('Blacklisted password')
            } else {
              const hash = await bcrypt.hash(pass, scryptParameters)
              const confirmationHash = shortid.generate()
              const link = `${app.config.baseUrl}/${confirmationHash}`
              dataPass.hash = hash
              dataPass.confirmation = {
                hash: confirmationHash.toString('base64'),
                issued: Date.now(),
                link: link
              }
            }
          })
        } else {
          return new Error('Not valid password !')
        }
      } else {
        return new Error('Passwords does not match !')
      }
    } else {
      return new Error('Password field is empty !')
    }
    return dataPass
  }

  userSchema.statics.resetUserPassword = async function resetUserPassword(req, res) {
    const userReq = req.user
    const data = req.body
    if (data.newPassword && data.repeatedNewPass) {
      await this.generateHashPassword(data.newPassword, data.repeatedNewPass).then(async pass => {
        const update = {
          hash: pass.hash,
          confirmation: pass.confirmation
        }
        await this.update({_id: userReq._id}, update, { runValidators: true }, null)
        return res.status(200).json({
          message: 'Password updated successfully !'
        })
      }).catch(err => {
        return res.status(500).json({
          error: err
        })
      })
    }
  }

  userSchema.statics.forgotUserPassword = async function forgotUserPassword(req, res) {
    try {
      const data = req.body
      if (validator.isEmail(data.email)) {
        const user = await this.findByEmail(data.email)
        const token = await user.generateAuthToken(user, true)
        await this.sendResetPasswordEmail(req, res, token).then(() => {
          return res.status(200).json({
            token,
            message: 'A verification email is send'
          })
        }).catch(err => {
          res.status(500).json({
            error: err
          })
          console.log('A verification email is NOT send')
        })
      }
    } catch (err) {
      if (err) {
        console.log('Error forgotten pass: ' + err)
      }
    }
  }

  userSchema.statics.redirectToResetPassword = async function redirectToResetPassword(req, res) {
    res.statusCode = 302
    res.setHeader('Location', app.config.UIPath + '/resetpassword?rt=' + req.token)
    res.end()
  }

  userSchema.statics.sendResetPasswordEmail = async function sendResetPasswordEmail(req, res, token) {
    const message = {
      to: req.body.email,
      subject: 'Click on the link to redirect ot reset password page !',
      text: app.config.baseUrl + '/redirectToResetPassword/' + token
    }
    return app.nodemailer(message)
  }

  userSchema.statics.privacyPolicyConfirmation = async function privacyPolicyConfirmation(req, res) {
    const user = req.user
    const body = req.body
    if (body.privacy) {
      user.privacy = true
      await user.save()
      const token = req.token
      return res.status(200).json({
        token,
        message: 'User privacy is set !'
      })
    } else {
      return res.status(500).json({
        message: 'User privacy confirmation filed !'
      })
    }
  }

  userSchema.statics.termsAndConditionsConfirm = async function termsAndConditionsConfirm(req, res) {
    const user = req.user
    const body = req.body
    if (body.terms) {
      user.terms = true
      await user.save()
      const token = req.token
      return res.status(200).json({
        token,
        message: 'User terms is set !'
      })
    } else {
      return res.status(500).json({
        message: 'User terms confirmation filed !'
      })
    }
  }

  userSchema.statics.cookiesPolicyConfirmation = async function cookiesPolicyConfirmation(req, res) {
    const user = req.user
    user.cookies = true
    const body = req.body
    if (body.cookies) {
      user.cookies = true
      if (user.cookies && user.terms && user.privacy) {
        user.verified = true
        user.role = ['user']
        await user.save()
        const token = await user.generateAuthToken(user)
        return res.status(200).json({
          user, token
        })
      } else {
        return res.status(500).json({
          message: 'Some of the conditions are not verified !'
        })
      }
    }
  }

  userSchema.statics.redirectToPrivacyPolicy = async function redirectToPrivacyPolicy(req, res) {
    res.statusCode = 302
    res.setHeader('Location', app.config.UIPath + '/privacypolicy?rt=' + req.token)
    res.end()
  }

  userSchema.statics.sendRegistrationEmail = async function sendRegistrationEmail(req, res, token) {
    const message = {
      to: req.body.email,
      subject: 'Click on the link to verify your email address !',
      text: app.config.baseUrl + '/redirectToPrivacyPolicy/' + token
    }
    return app.nodemailer(message)
  }

  userSchema.statics.registerUserAccount = async function registerUserAccount(req, res) {
    const data = req.body
    const pass = await this.generateHashPassword(data.password, data.repeatedPass)
    data._id = new app.mongoose.Types.ObjectId()
    data.hash = pass.hash
    data.confirmation = pass.confirmation
    data.verified = false
    await this.create(data)
      .then(async user => {
        const token = await user.generateAuthToken(user, true)
        await this.sendRegistrationEmail(req, res, token)
        console.log('The user is created successfully !!!')
        return res.status(200).json({
          token
        })
      })
      .catch(err => {
        return res.status(500).json({
          error: err
        })
      })
  }

  userSchema.statics.logoutAllUserAccount = async function logoutAllUserAccount (req, res) {
    try {
      req.user.tokens = []
      await req.user.save()
      res.status(200).json({
        message: 'Logout All success !'
      })
    } catch (e) {
      res.status(500).json({
        error: 'Logout All fail !'
      })
    }
  }

  userSchema.statics.logoutUserAccount = async function logoutUserAccount(req, res) {
    try {
      req.user.tokens = req.user.tokens.filter(token => {
        return token.token !== req.token
      })
      await req.user.save()
      res.status(200).json({
        message: 'Logout success !'
      })
    } catch (e) {
      res.status(500).json({
        error: 'Logout fail !'
      })
    }
  }

  userSchema.statics.loginUserAccount = async function loginUserAccount(req, res) {
    const data = req.body
    if (validator.isEmail(data.email) && passValidation.validate(data.password)) {
      try {
        const user = await this.findByCredentials(data)
        if (user.verified) {
          const token = await user.generateAuthToken(user)
          return res.status(200).json({
            user, token
          })
        } else {
          return res.status(500).json({
            message: 'Some of the conditions are not accepted !'
          })
        }
      } catch (e) {
        return res.status(500).json({
          message: 'Cant find the user !'
        })
      }
    } else {
      return res.status(500).json({
        message: 'Cant login because of wrong user or password !'
      })
    }
  }

  userSchema.statics.updateAvatar = async function updateUserAvatar(req, res) {
    const avatarPath = 'uploads/images/avatars/' + req.user.id + '.png'
    await sharp(req.file.buffer).resize(250, 250).toFile(avatarPath)
    req.user.avatar = 'http://' + req.headers.host + '/' + avatarPath
    await req.user.save()
    await this.getAvatar(req, res)
  }

  userSchema.statics.deleteAvatar = async function updateUserAvatar(req, res) {
    req.user.avatar = undefined
    await req.user.save()
    return res.status(200).json({
      message: 'User avatar was deleted successfully !'
    })
  }

  userSchema.statics.getAvatar = async function getUserAvatar(req, res) {
    try {
      const user = req.user
      await this.findById(user._id).then(data => {
        if (!data || !data.avatar) {
          throw new Error()
        }
        res.set('Content-Type', 'image/png')
        return res.status(200).json(
          data.avatar
        )
      })
    } catch (err) {
      return res.status(404).json({
        error: 'Cant fetch the avatar !'
      })
    }
  }

  userSchema.statics.updateUserAccount = async function updateUserAccount(req, res) {
    const userReq = req.user
    const data = req.body
    if (data.newPassword && data.repeatedNewPass) {
      await this.generateHashPassword(data.newPassword, data.repeatedNewPass).then(async pass => {
        const update = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          nickName: data.nickName,
          hash: pass.hash,
          confirmation: pass.confirmation
        }

        await this.update({_id: userReq._id}, update, { runValidators: true }, null)
        const user = await this.findById(userReq._id)

        return res.status(200).json({
          user
        })
      }).catch(err => {
        return res.status(500).json({
          error: err
        })
      })
    } else {
      const userData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        nickName: data.nickName
      }
      await this.update({_id: userReq._id}, userData, { runValidators: true }, null)
      const user = await this.findById(userReq._id)
      return res.status(200).json({
        user
      })
    }
  }

  userSchema.statics.deleteUser = async function deleteUser(req, res) {
    const userId = req.user._id
    if (userId) {
      try {
        this.remove({_id: userId}, (err, result) => {
          if (err) return err
        })
      } catch (err) {
        return res.status(500).json({
          error: err
        })
      }
    } else {
      console.log('Missing user _id for delete !')
    }
  }

  userSchema.statics.findByCredentials = async function findByCredentials(data) {
    const user = await this.findByEmail(data.email)
    if (!user) {
      throw new Error('Unable to login!')
    }
    const isMatch = await bcrypt.compare(data.password, user.hash)

    if (!isMatch) {
      throw new Error('Unable to login!')
    }
    return user
  }

  userSchema.statics.findByNickname = async function findByNickname(nickname) {
    await this.findOne({
      nickname: { $regex: `^${nickname}$`, $options: 'i' }
    }, (err, user) => {
      if (err) console.log(err)
      return user
    })
  }

  userSchema.statics.findByEmail = async function findByEmail(email) {
    const user = await this.findOne({
      email: { $regex: `^${email}$`, $options: 'i' }
    })
    return user
  }

  userSchema.statics.findById = async function findById(id) {
    const user = await this.findOne({
      _id: id
    })
    return user
  }

  userSchema.statics.findByIdAndJWT = async function findByIdAndJWT(id, token) {
    const user = await this.findOne({
      _id: id,
      'tokens.token': token
    })
    await user.save()
    return user
  }

  userSchema.methods.generateAuthToken = async function generateAuthToken(user, isReset) {
    let token = null
    if (isReset) {
      token = jwt.sign(
        {_id: user._id},
        app.config.JWT_KEY,
        {expiresIn: '10h'}
      )
    } else {
      token = jwt.sign(
        {_id: user._id},
        app.config.JWT_KEY,
        {expiresIn: '1h'}
      )
    }
    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token
  }

  userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.hash
    delete userObject.tokens

    return userObject
  }

  return app.mongoose.model('User', userSchema)
}
