const Base = require('./base.js');
const Common = require('./common.js');

module.exports = class extends Base {
  async indexAction() {
    if (Common.isLogin(this)) {
      this.ctx.redirect('/xiangtian/login');
    }
  }
};
