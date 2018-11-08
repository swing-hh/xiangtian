const Base = require('./base.js');
const Common = require('./common.js');

module.exports = class extends Base {
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

  //主页面
  async indexAction() {
    return this.display(think.ROOT_PATH + "/view/pc/index.html");
  }

  //汇总面
  async summaryAction() {
    return this.display(think.ROOT_PATH + "/view/pc/summary.html");
  }

  //续卡
  async continuedCardAction() {
    return this.display(think.ROOT_PATH + "/view/pc/continuedCard.html");
  }

  //退订
  async unsubscribeAction() {
    return this.display(think.ROOT_PATH + "/view/pc/unsubscribe.html");
  }

  //派单
  async sendOutAction() {
    return this.display(think.ROOT_PATH + "/view/pc/sendOut.html");
  }

  //详情
  async detailsAction() {
    return this.display(think.ROOT_PATH + "/view/pc/details.html");
  }
};
