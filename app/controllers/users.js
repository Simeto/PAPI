'use strict'

module.exports = app => {
  const User = app.models.User
  return {
    async resetPassword(req, res) {
      await User.resetUserPassword(req, res)
    },
    async forgotPassword(req, res) {
      await User.forgotUserPassword(req, res)
    },
    async redirectPrivacyPolicy(req, res) {
      await User.redirectToPrivacyPolicy(req, res)
    },
    async privacyPolicyConfirmed(req, res) {
      await User.privacyPolicyConfirmation(req, res)
    },
    async termsConfirmation(req, res) {
      await User.termsAndConditionsConfirm(req, res)
    },
    async cookiesConfirmation(req, res) {
      await User.cookiesPolicyConfirmation(req, res)
    },
    async redirectToReset(req, res) {
      await User.redirectToResetPassword(req, res)
    },
    async logoutAll(req, res) {
      await User.logoutAllUserAccount(req, res)
    },
    async logoutUser(req, res) {
      await User.logoutUserAccount(req, res)
    },
    async loginUser(req, res, next) {
      await User.loginUserAccount(req, res)
    },
    async registerUser(req, res, next) {
      await User.registerUserAccount(req, res)
    },
    async deleteUser(req, res, next) {
      await User.deleteUser(req, res)
    },
    async updateUserProfile(req, res, next) {
      await User.updateUserAccount(req, res)
    },
    async updateUserAvatar(req, res, next) {
      await User.updateAvatar(req, res)
    },
    async deleteUserAvatar(req, res, next) {
      await User.deleteAvatar(req, res)
    },
    async getUserAvatar(req, res, next) {
      await User.getAvatar(req, res)
    }
  }
}
