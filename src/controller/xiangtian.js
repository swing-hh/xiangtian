const Base = require('./base.js');
const Common = require('./common.js');
const Moment = require('moment');
const nodeExcel = require('excel-export');
const Fs = require('fs');

module.exports = class extends Base {
  //登录
  async loginAction() {
    return this.display(think.ROOT_PATH + "/view/pc/login.html");
  }

  //主页面
  async indexAction() {
    if (Common.isLogin(this)) {
      let self = this;
      let get = self.get();
      let name = get.name == undefined || get.name == "" ? "" : get.name;
      let start = get.start == undefined || get.start == "" ? 0 : Moment(get.start).unix();
      let end = get.end == undefined || get.end == "" ? 9999999999 : Moment(get.end).unix();
      let userModel = self.model('user');
      let userData = await userModel
        .where(`yb_xiangtian_user.isHidden = 1 AND yb_xiangtian_user.name LIKE '%${name}%' AND yb_xiangtian_user.reserveTime >= ${start} AND yb_xiangtian_user.reserveTime <= ${end}`)
        .join("yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_user.milkType")
        .order('yb_xiangtian_user.reserveTime DESC')
        .field(`yb_xiangtian_user.id, yb_xiangtian_user.name, yb_xiangtian_user.telphone, yb_xiangtian_milk_type.typeName, yb_xiangtian_user.addressType, yb_xiangtian_user.address, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y年%m月%d日') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.everyNum, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks`)
        .select();
      //self.body = userData;
      self.assign({
        data: userData,
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/index.html");
    }
  }

  //汇总面
  async summaryAction() {
    if (Common.isLogin(this)) {
      let self = this;
      self.assign({
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/summary.html");
    }
  }

  //续卡
  async continuedCardAction() {
    if (Common.isLogin(this)) {
      let self = this;
      let continuedCardModel = self.model('continued_card');
      let get = self.get();
      let start = get.start == undefined || get.start == "" ? 0 : Moment(get.start).unix();
      let end = get.end == undefined || get.end == "" ? 9999999999 : Moment(get.end).unix();
      let continuedCardData = await continuedCardModel
        .where(`yb_xiangtian_continued_card.receivablesTime >= ${start} AND yb_xiangtian_continued_card.receivablesTime <= ${end}`)
        .join('yb_xiangtian_user ON yb_xiangtian_user.id = yb_xiangtian_continued_card.userId')
        .join('yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_user.milkType')
        .order('yb_xiangtian_continued_card.receivablesTime DESC')
        .select();
      self.body = continuedCardData;
      // self.assign({
      //   name: self.cookie('name')
      // });
      // return this.display(think.ROOT_PATH + "/view/pc/continuedCard.html");
    }
  }

  //退订
  async unsubscribeAction() {
    if (Common.isLogin(this)) {
      let self = this;
      self.assign({
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/unsubscribe.html");
    }
  }

  //派单
  async sendOutAction() {
    if (Common.isLogin(this)) {
      let self = this;
      self.assign({
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/sendOut.html");
    }
  }

  //详情
  async detailsAction() {
    if (Common.isLogin(this)) {
      let self = this;
      self.assign({
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/details.html");
    }
  }
};
