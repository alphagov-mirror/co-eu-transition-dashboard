const Page = require('core/pages/page');
const { paths } = require('config');
const authentication = require('services/authentication');
const { METHOD_NOT_ALLOWED } = require('http-status-codes');
const config = require('config');
const flash = require('middleware/flash');

class PasswordReset extends Page {
  get url() {
    return paths.authentication.passwordReset;
  }

  get middleware() {
    return [
      ...authentication.protect(['admin', 'user']),
      flash
    ];
  }

  next() {
    if (this.req.user.role === 'admin') {
      this.res.redirect(config.paths.admin.import);
    } else {
      this.res.redirect(config.paths.allData);
    }
  }

  get mode() {
    const pathToCompare = this.req.path === '/' ? paths.authentication.passwordReset : `${paths.authentication.passwordReset}${this.req.path}`;

    switch(pathToCompare) {
      case paths.authentication.passwordResetComplete:
        return 'password-reset-complete';
      default:
        return 'password-reset';
    }
  }

  validatePassword(password, confirmPassword) {
    const passwordLength = password.length;
    const passwordHasNumbers = /\d/.test(password);
    const passwordLowerCase = /[a-z]/.test(password);
    const passwordUpperCase = /[A-Z]/.test(password);
    const passwordSpecialCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
    const passwordsMatch = password === confirmPassword;

    let error;

    if (passwordLength < 8) {
      error = 'The password must have a minimum of 8 charaters';
    } else if (!passwordHasNumbers) {
      error = 'The password must contain at least one number';
    } else if (!passwordLowerCase) {
      error = 'The password must contain at least one lowercase charater';
    } else if (!passwordUpperCase) {
      error = 'The password must contain at least one uppercase charater';
    } else if (!passwordSpecialCharacter) {
      error = 'The password must contain at least one special character';
    } else if (!passwordsMatch) {
      error = 'The passwords must match';
    }

    return error;
  }

  async passwordReset() {
    const password = this.req.body.password;
    const confirmPassword = this.req.body['confirm-password'];

    const error = this.validatePassword(password, confirmPassword);
    if (error) {
      this.req.flash(error);
      return this.res.redirect(config.paths.authentication.passwordReset);
    }

    const hashedPassphrase = await authentication.hashPassphrase(password);
    await this.req.user.update({
      hashedPassphrase,
      passwordReset: false
    });

    return this.res.redirect(config.paths.authentication.passwordResetComplete);
  }

  async postRequest(req, res) {
    switch(this.mode) {
      case 'password-reset':
        await this.passwordReset();
        break;
      default:
        res.sendStatus(METHOD_NOT_ALLOWED);
    }
  }
}

module.exports = PasswordReset;