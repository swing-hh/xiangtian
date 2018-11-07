const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }
  //登录
  loginAction() {
    if (Math.random() >= 0.5) {
      return this.display(think.ROOT_PATH + "/view/pc/login.html");
    } else {
      return this.display(think.ROOT_PATH + "/view/m/login.html");
    }
  }
};
