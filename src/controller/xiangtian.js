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
      let userModel = self.model('user');
      let productionModel = self.model('production');
      let userData = await userModel
        .where('yb_xiangtian_user.isHidden = 1')
        .join('yb_xiangtian_milk_type ON yb_xiangtian_milk_type.id = yb_xiangtian_user.milkType')
        .field(`yb_xiangtian_user.id, yb_xiangtian_user.name, yb_xiangtian_user.telphone, yb_xiangtian_milk_type.typeName, yb_xiangtian_user.address, FROM_UNIXTIME(yb_xiangtian_user.reserveTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.everyNum, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks`)
        .select();
      let startTime = await productionModel
        .order('yb_xiangtian_production.sendOutTime ASC') 
        .find();
      let endTime = await productionModel
        .order('yb_xiangtian_production.sendOutTime DESC')
        .find();
      let productionData = await productionModel
        .order('yb_xiangtian_production.sendOutTime ASC')
        .field(`yb_xiangtian_production.userId, yb_xiangtian_production.milkNum, FROM_UNIXTIME(yb_xiangtian_production.sendOutTime, '%y/%m/%d') as sendOutTime, yb_xiangtian_production.sendOutTime as unixTime`)
        .select();
      //生成所有的时间段
      let timeSlot = [];  //["18/11/22","18/11/23","18/11/24"]
      let a = (endTime.sendOutTime - startTime.sendOutTime) / 60 / 60 / 24;
      for (let i = 0; i <= a; i++) {
        timeSlot.push(Common.fmtDate((startTime.sendOutTime + 60 * 60 * 24 * i) * 1000))
      }
      let productionArr = [];
      //先把有数据得用户生成了
      for (let j = 0; j < productionData.length; j++) {
        let isCunZai = false;
        for (let i = 0; i < productionArr.length; i++) {
          //代表已经添加过
          if (productionData[j].userId == productionArr[i].userId) {
            isCunZai = true;
            break;
          }
        }
        if (!isCunZai) {
          productionArr.push({
            userId: productionData[j].userId,
            timeData: new Array(timeSlot.length)
          });
        }
      }
      //填一下这些用户对应得时间
      for (let i = 0; i < productionArr.length; i++) {
        for (let j = 0; j < productionData.length; j++) {
          if (productionArr[i].userId == productionData[j].userId) {
            productionArr[i].timeData[(productionData[j].unixTime - startTime.sendOutTime) / 60 / 60 / 24] = productionData[j].milkNum;
          }
        }
      }
      //将这些数据继承到userData上
      for (let i = 0; i < userData.length; i++) {
        for (let j = 0; j < productionArr.length; j++) {
          if (userData[i].id == productionArr[j].userId) {
            userData[i].timeData = productionArr[j].timeData;
          }
        }
      }
      //生成所有空
      for (let i = 0; i < userData.length; i++) {
        if (userData[i].timeData == undefined) {
          userData[i].timeData = new Array(timeSlot.length);
        }
      }
      //把null设置成0
      for (let i = 0; i < userData.length; i++) {
        for (let j = 0; j < userData[i].timeData.length; j++) {
          if (userData[i].timeData[j] == null) {
            userData[i].timeData[j] = 0;
          }
        }
      }
      //self.body = userData;
      self.assign({
        timeSlot: timeSlot,
        userData: userData,
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
        .field(`yb_xiangtian_user.id, yb_xiangtian_math_milk.operationType, yb_xiangtian_user.name, yb_xiangtian_user.everyNum, yb_xiangtian_user.telphone, yb_xiangtian_user.milkType as typeName, yb_xiangtian_user.address, yb_xiangtian_user.addressType, FROM_UNIXTIME(yb_xiangtian_math_milk.addMilkTime, '%y/%m/%d') as reserveTime, yb_xiangtian_user.total, yb_xiangtian_user.consume, yb_xiangtian_user.weekSendOut, yb_xiangtian_user.remarks, yb_xiangtian_math_milk.milkNum, yb_xiangtian_milk_type.typeName as milkType, yb_xiangtian_math_milk.temporaryRemark`)
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
      let delId = [];
      for (var i = 0; i < defaultMilkData.length; i++) {
        for (var j = 0; j < mathMilkData.length; j++) {
          if (defaultMilkData[i].id == mathMilkData[j].id) {
            if (mathMilkData[j].operationType == 0) {
              delId.push(defaultMilkData[i].id);
            }
          }
        }
      }
      for (var i = 0; i < defaultMilkData.length; i++) {
        for (var j = 0; j < delId.length; j++) {
          if (defaultMilkData[i].id == delId[j]) {
            defaultMilkData.splice(i, 1);
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
      //self.body = mathMilkData; 
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

  //地址数字
  async addressNumberAction() {
    if (Common.isLogin(this)) {
      let self = this;
      let addressNumberModel = self.model('address_number');
      let addressNumberData = await addressNumberModel
        .order('yb_xiangtian_address_number.number DESC')
        .field('yb_xiangtian_address_number.id, yb_xiangtian_address_number.number, yb_xiangtian_address_number.address')
        .select();
      self.assign({
        data: addressNumberData,
        name: self.cookie('name')
      });
      return this.display(think.ROOT_PATH + "/view/pc/addressNumber.html");
    }
  }
};
