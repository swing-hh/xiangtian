const Base = require('./base.js');
const Common = require('./common.js');

module.exports = class extends Base {
  indexAction() {
    return this.display(think.ROOT_PATH + "/view/m/login.html");
  }
  //登录
  async loginAction() {
    //重定向
    //this.ctx.redirect('/xiangtian/index')
    //if (Common.isPc(this)) {
    return this.display(think.ROOT_PATH + "/view/pc/login.html");
    // } else {
    //   return this.display(think.ROOT_PATH + "/view/m/login.html");
    // }
  }
};
