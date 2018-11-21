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
        .field(`yb_xiangtian_user.id, yb_xiangtian_user.name, yb_xiangtian_user.telphone, yb_xiangtian_milk_type.typeName, yb_xiangtian_user.addressType, yb_xiangtian_user.address, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.everyNum, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks`)
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
        .field(`yb_xiangtian_continued_card.id, yb_xiangtian_user.name, yb_xiangtian_user.telphone, yb_xiangtian_milk_type.typeName, yb_xiangtian_user.address, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.everyNum, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks, yb_xiangtian_continued_card.payee, yb_xiangtian_continued_card.money, FROM_UNIXTIME(yb_xiangtian_continued_card.receivablesTime, '%y/%m/%d') as receivablesTime`)
        .select();
      //self.body = continuedCardData;
      self.assign({
        data: continuedCardData,
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/continuedCard.html");
    }
  }

  //退订
  async unsubscribeAction() {
    if (Common.isLogin(this)) {
      let self = this;
      let unsubscribeModel = self.model('unsubscribe');
      let get = self.get();
      let start = get.start == undefined || get.start == "" ? 0 : Moment(get.start).unix();
      let end = get.end == undefined || get.end == "" ? 9999999999 : Moment(get.end).unix();
      let unsubscribeData = await unsubscribeModel
        .where(`yb_xiangtian_unsubscribe.unsubscribeTime >= ${start} AND yb_xiangtian_unsubscribe.unsubscribeTime <= ${end}`)
        .join('yb_xiangtian_user ON yb_xiangtian_user.id = yb_xiangtian_unsubscribe.userId')
        .join('yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_user.milkType')
        .order('yb_xiangtian_unsubscribe.unsubscribeTime DESC')
        .field(`yb_xiangtian_unsubscribe.id, yb_xiangtian_user.name, yb_xiangtian_user.telphone, yb_xiangtian_user.milkType, yb_xiangtian_user.address, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.everyNum, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks, FROM_UNIXTIME(yb_xiangtian_unsubscribe.unsubscribeTime, '%y/%m/%d') as unsubscribeTime, yb_xiangtian_unsubscribe.unsubscribeReason`)
        .select();
      //self.body = unsubscribeData;
      self.assign({
        data: unsubscribeData,
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/unsubscribe.html");
    }
  }

  //派单
  async sendOutAction() {
    if (Common.isLogin(this)) {
      let self = this;
      let mathMilkModel = self.model('math_milk');
      let userModel = self.model('user');
      //获取当前时间时间戳
      let time = self.get("time") == undefined || self.get('time') == '' ? Moment(Moment().year() + "-" + (Moment().month() + 1) + "-" + Moment().date()).unix() : Moment(self.get('time')).unix();
      //获得当前是周几
      let week = (new Date(time * 1000)).getDay() == '0' ? '7' : (new Date(time * 1000)).getDay();
      //先查询一下当天加减奶
      let mathMilkData = await mathMilkModel
        .where(`yb_xiangtian_math_milk.addMilkTime = ${time}`)
        .join('yb_xiangtian_user ON yb_xiangtian_user.id = yb_xiangtian_math_milk.userId')
        .join('yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_math_milk.milkType')
        .field(`yb_xiangtian_user.id, yb_xiangtian_math_milk.operationType, yb_xiangtian_user.name, yb_xiangtian_user.everyNum, yb_xiangtian_user.telphone, yb_xiangtian_user.milkType as typeName, yb_xiangtian_user.address, yb_xiangtian_user.addressType, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks, yb_xiangtian_math_milk.milkNum, yb_xiangtian_milk_type.typeName as milkType, yb_xiangtian_math_milk.temporaryRemark`)
        .select();
      for (var i = 0; i < mathMilkData.length; i++) {
        if (mathMilkData[i].typeName == 1) {
          mathMilkData[i].typeName = "巴氏奶（大）";
        } else if (mathMilkData[i].typeName == 2) {
          mathMilkData[i].typeName = "巴氏奶（小）";
        } else if (mathMilkData[i].typeName == 3) {
          mathMilkData[i].typeName = "酸奶（大）";
        } else {
          mathMilkData[i].typeName = "酸奶（小）";
        }
      }
      //查询一下当天默认送奶
      let defaultMilkData = await userModel
        .where(`yb_xiangtian_user.isHidden = 1 AND yb_xiangtian_user.weekSendOut LIKE '%${week}%'`)
        .join('yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_user.milkType')
        .order('yb_xiangtian_user.addressType DESC')
        .field(`yb_xiangtian_user.id, yb_xiangtian_user.name, yb_xiangtian_user.everyNum, yb_xiangtian_user.telphone,yb_xiangtian_milk_type.typeName, yb_xiangtian_user.address, yb_xiangtian_user.addressType, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks`)
        .select();
      for (var i = 0; i < defaultMilkData.length; i++) {
        defaultMilkData[i].milkNum = defaultMilkData[i].everyNum;
        defaultMilkData[i].temporaryRemark = '';
        defaultMilkData[i].milkType = defaultMilkData[i].typeName;
        defaultMilkData[i].operationType = 1;
      }
      for (var i = 0; i < defaultMilkData.length; i++) {
        for (var j = 0; j < mathMilkData.length; j++) {
          if (defaultMilkData[i].id == mathMilkData[j].id) {
            if (mathMilkData[j].operationType == 0) {
              defaultMilkData.splice(i, 1);
            }
          }
        }
      }
      for (var i = 0; i < mathMilkData.length; i++) {
        if (mathMilkData[i].operationType == 1) {
          defaultMilkData.push(mathMilkData[i]);
        }
      }
      defaultMilkData.sort(function (a, b) {
        return a.addressType - b.addressType;
      })
      //整合一下所有得酸奶数量
      let allMilk = [0, 0, 0, 0];
      for (var i = 0; i < defaultMilkData.length; i++) {
        if (defaultMilkData[i].milkType == "巴氏奶（大）") {
          allMilk[0] = allMilk[0] + defaultMilkData[i].milkNum;
        } else if (defaultMilkData[i].milkType == "巴氏奶（小）") {
          allMilk[1] = allMilk[1] + defaultMilkData[i].milkNum;
        } else if (defaultMilkData[i].milkType == "酸奶（大）") {
          allMilk[2] = allMilk[2] + defaultMilkData[i].milkNum;
        } else {
          allMilk[3] = allMilk[3] + defaultMilkData[i].milkNum;
        }
      }
      //self.body = allMilk;
      self.assign({
        allMilk: allMilk,
        defaultMilkData: defaultMilkData,
        mathData: mathMilkData,
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/sendOut.html");
    }
  }

  //详情
  async detailsAction() {
    if (Common.isLogin(this)) {
      let self = this;
      let userModel = self.model('user');
      let id = self.get('id');
      let userData = await userModel
        .where(`yb_xiangtian_user.id = ${id}`)
        .join('yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_user.milkType')
        .field(`yb_xiangtian_user.id, yb_xiangtian_user.name, yb_xiangtian_user.telphone, yb_xiangtian_user.address, yb_xiangtian_user.addressType, yb_xiangtian_milk_type.typeName, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '20%y-%m-%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.everyNum, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks`)
        .select();
      // self.body = userData;
      self.assign({
        data: userData[0],
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/details.html");
    }
  }
};
