'use strict'
const PasswordValidator = require('password-validator')
const validator = require('validator')
const passValidation = new PasswordValidator()
const TokensSchema = require('./TokensSchema')
const ConfirmationSchema = require('./ConfirmationSchema')
module.exports = (app) => {
  const tokensSchema = TokensSchema(app)
  const confirmationSchema = ConfirmationSchema(app)
  passValidation.is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces()

  const userSchema = new app.mongoose.Schema({
    _id: app.mongoose.Schema.Types.ObjectId,
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid')
        }
      }
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    nickName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3
    },
    tokens: [tokensSchema],
    avatar: {
      type: String
    },
    verified: {
      type: Boolean,
      required: true,
      default: false
    },
    privacy: {
      type: Boolean,
      default: false
    },
    terms: {
      type: Boolean,
      default: false
    },
    cookies: {
      type: Boolean,
      default: false
    },
    role: {
      type: [String],
      enum: ['admin', 'user', 'candidate'],
      default: ['candidate']
    },
    // status: {
    //   type: String
    // },
    // workSpace: {
    //   type: String
    // },
    // hourlyRate: {
    //   currency: String,
    //   amount: Number
    // },
    // timeZone: {
    //   type: String
    // },
    // dateFormat: {
    //   type: String
    // },
    // deleted: {
    //   type: Boolean,
    //   default: false
    // },
    // deletedAt: {
    //   type: Date
    // },
    hash: String,
    preRegistration: Boolean,
    confirmation: confirmationSchema
  })
  return userSchema
}
