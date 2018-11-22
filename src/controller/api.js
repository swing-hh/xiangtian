const Base = require('./base.js');
const Common = require('./common.js');
const Moment = require('moment');
const nodeExcel = require('excel-export');
const excel = require('node-excel-export');
const xlsx = require('node-xlsx');
const path = require('path');
const fs = require('fs');

module.exports = class extends Base {
  //登录
  async loginAction() {
    let self = this;
    let get = self.get();
    let name = get.name;
    let pwd = get.pwd;

    let adminUserModel = self.model('admin_user');
    let data = await adminUserModel
      .where({ name: name, password: pwd })
      .field('id, name')
      .select();
    if (data.length == 1) {
      self.cookie('id', `${data[0].id}`, { // 设定 cookie 时指定额外的配置
        maxAge: 24 * 3600 * 1000,
        path: '/'
      });
      self.cookie('name', `${data[0].name}`, { // 设定 cookie 时指定额外的配置
        maxAge: 24 * 3600 * 1000,
        path: '/'
      })
      self.body = Common.suc(data[0]);
    } else {
      self.body = Common.err("账号或密码错误");
    }
  }

  //添加用户
  async addUserAction() {
    let self = this;
    let userModel = self.model('user');
    let get = self.get();
    let remarks = get.remarks == undefined || get.remarks == '' ? "" : get.remarks;
    let everyNum = get.everyNum == undefined || get.everyNum == "" ? 0 : get.everyNum;
    await userModel.add({
      isHidden: 1,
      generateTime: Moment().unix(),
      name: get.name,
      telphone: get.telphone,
      milkType: get.milkType,
      address: get.address,
      addressType: get.addressType,
      reserveTime: Moment(get.time).unix(),
      total: get.total,
      consume: 0,
      weekSendOut: get.weekSendOut,
      remarks: remarks,
      everyNum: everyNum
    });
    self.ctx.redirect('/xiangtian');
  }

  //更新用户信息
  async updateUserAction() {
    let self = this;
    let userModel = self.model('user');
    let get = self.get();
    await userModel
      .where({ id: get.userId })
      .update({
        name: get.name,
        telphone: get.telphone,
        milkType: get.milkType,
        address: get.address,
        addressType: get.addressType,
        reserveTime: Moment(get.time).unix(),
        total: get.total,
        everyNum: get.everyNum,
        weekSendOut: get.weekSendOut,
        remarks: get.remarks
      });
    self.body = Common.suc({});
  }

  //续卡
  async continuedCardAction() {
    let self = this;
    let get = self.get();
    let userModel = self.model('user');
    let continuedCardModel = self.model('continued_card');
    let userData = await userModel
      .where({ id: get.userId })
      .field('id, total')
      .select();
    let totalMilkNum = parseInt(userData[0].total) + parseInt(get.addMilkNum);
    await userModel
      .where({ id: get.userId })
      .update({
        total: totalMilkNum
      });
    await continuedCardModel.add({
      isHidden: 1,
      generateTime: Moment().unix(),
      userId: get.userId,
      addMilkType: get.addMilkNum,
      payee: get.payee,
      money: get.money,
      receivablesTime: Moment(get.time).unix()
    })
    self.ctx.redirect('/xiangtian');
  }

  //退订
  async unsubscribeAction() {
    let self = this;
    let get = self.get();
    let userModel = self.model('user');
    let unsubscribeModel = self.model('unsubscribe');
    await userModel
      .where({ id: get.userId })
      .update({
        isHidden: 0
      });
    await unsubscribeModel
      .add({
        isHidden: 1,
        generateTime: Moment().unix(),
        userId: get.userId,
        unsubscribeTime: Moment(get.time).unix(),
        unsubscribeReason: get.reason
      })
    self.ctx.redirect('/xiangtian');
  }

  //加奶
  async addMilkAction() {
    let self = this;
    let get = self.get();
    let mathMilkModel = self.model('math_milk');
    await mathMilkModel
      .where({
        addMilkTime: Moment(get.time).unix(),
        userId: get.userId,
        operationType: 1
      })
      .delete();
    await mathMilkModel
      .add({
        isHidden: 1,
        generateTime: Moment().unix(),
        userId: get.userId,
        operationType: 1,
        milkType: get.milkType,
        milkNum: get.milkNum,
        temporaryRemark: get.remart,
        addMilkTime: Moment(get.time).unix()
      });
    self.ctx.redirect('/xiangtian');
  }

  //减奶
  async reduceMilkAction() {
    let self = this;
    let get = self.get();
    let mathMilkModel = self.model('math_milk');
    await mathMilkModel
      .where({
        addMilkTime: Moment(get.time).unix(),
        userId: get.userId
      })
      .delete();
    await mathMilkModel
      .add({
        isHidden: 1,
        generateTime: Moment().unix(),
        userId: get.userId,
        operationType: 0,
        milkType: 1,
        milkNum: 1,
        temporaryRemark: '',
        addMilkTime: Moment(get.time).unix()
      });
    self.ctx.redirect('/xiangtian');
  }

  //删除加减奶
  async delMathMilkAction() {
    let self = this;
    let mathMilkModel = self.model('math_milk');
    let productionModel = self.model('production');
    let userModel = self.model('user');
    let get = self.get();
    let time = self.get('time') == '' || self.get('time') == undefined ? Moment().year() + "-" + (Moment().month() + 1) + "-" + Moment().date() : self.get('time');
    let productionNum = await productionModel
      .where({ userId: get.id, sendOutTime: Moment(time).unix() })
      .field('milkNum')
      .select();
    let userData = await userModel
      .where({ id: get.id })
      .select();
    //已经生成过数据了 大于0条
    if (productionNum.length) {
      //加奶
      if (get.type == 1) {
        await userModel
          .where({ id: get.id })
          .update({
            consume: userData[0].consume - productionNum[0].milkNum
          });
        await productionModel
          .where({ userId: get.id, sendOutTime: Moment(time).unix() })
          .delete();
        //减奶
      } else {
        await userModel
          .where({ id: get.id })
          .update({
            consume: userData[0].consume + userData[0].everyNum
          });
        await productionModel
          .add({
            isHidden: 1,
            generateTime: Moment().unix(),
            userId: get.id,
            milkNum: userData[0].everyNum,
            temporaryRemarks: '',
            milkType: userData[0].milkType,
            sendOutTime: Moment(time).unix()
          });
      }
    }
    await mathMilkModel
      .where({ userId: get.id, addMilkTime: Moment(time).unix() })
      .delete();
    self.body = productionNum;
    self.body = Common.suc({});
  }

  //退出登录
  async exitLoginAction() {
    let self = this;
    self.cookie('id', null);
    self.cookie('name', null);
    self.body = Common.suc({});
  }

  async excelAction() {
    let self = this;
    const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', 111, '0.3'], ['baz', null, 'qux']];
    var buffer = xlsx.build([{ name: "mySheetName", data: data }]);
    //fs.writeFileSync('user.xlsx', buffer, 'binary'); 
    self.ctx.set('Content-Type', 'text/plain');
    self.ctx.set('Content-Type', 'application/vnd.openxmlformats');
    self.ctx.set("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    self.ctx.res.write(buffer)
  }

  //生成派送
  async generateSendOutAction() {
    let self = this;
    if (self.ctx.isPost) {
      let userModel = self.model('user');
      let productionModel = self.model('production');
      let time = self.ctx.post('time') == '' || self.ctx.post('time') == undefined ? Moment().year() + "-" + (Moment().month() + 1) + "-" + Moment().date() : self.ctx.post('time');
      let postData = JSON.parse(self.ctx.post('data'));
      let timeData = await productionModel
        .where({ sendOutTime: Moment(time).unix() })
        .select();
      if (!timeData.length) {
        for (let i = 0; i < postData.length; i++) {
          await userModel
            .where({ id: postData[i].id })
            .update({
              consume: postData[i].milkNum + postData[i].consume
            })
          let milkType;
          if (postData[i].milkType == "巴氏奶（大）") {
            milkType = 1;
          } else if (postData[i].milkType == "巴氏奶（小）") {
            milkType = 2;
          } else if (postData[i].milkType == "酸奶（大）") {
            milkType = 3;
          } else {
            milkType = 4;
          }
          await productionModel
            .add({
              isHidden: 1,
              generateTime: Moment().unix(),
              userId: postData[i].id,
              milkNum: postData[i].milkNum,
              milkType: milkType,
              sendOutTime: Moment(time).unix(),
              temporaryRemarks: postData[i].temporaryRemark
            });
        }
      }
      self.body = Common.suc({});
    }
  }
};
