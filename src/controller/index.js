const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    this.ctx.redirect('/xiangtian/login');
  }
};
