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
    if (self.ctx.isPost) {
      let post = self.post();
      let name = post.name;
      let pwd = post.pwd;

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
  }

  //log打点
  async logAction() {
    let self = this;
    let get = self.get();
    let logModel = self.model('log');
    await logModel
      .add({
        isHidden: 1,
        generateTime: Moment().unix(),
        userId: get.userId,
        logType: get.logId
      })
    self.body = Common.suc({});
  }

  //添加用户
  async addUserAction() {
    let self = this;
    if (self.ctx.isPost) {
      let userModel = self.model('user');
      let post = self.post();
      let remarks = post.remarks == undefined || post.remarks == '' ? "" : post.remarks;
      let everyNum = post.everyNum == undefined || post.everyNum == "" ? 0 : post.everyNum;
      await userModel.add({
        isHidden: 1,
        generateTime: Moment().unix(),
        name: post.name,
        telphone: post.telphone,
        milkType: post.milkType,
        address: post.address,
        addressType: post.addressType,
        reserveTime: Moment(post.time).unix(),
        total: post.total,
        consume: 0,
        weekSendOut: post.weekSendOut,
        remarks: remarks,
        everyNum: everyNum
      });
      self.body = Common.suc({});
    }
  }

  //更新用户信息
  async updateUserAction() {
    let self = this;
    if (self.ctx.isPost) {
      let userModel = self.model('user');
      let post = self.post();
      await userModel
        .where({ id: post.userId })
        .update({
          name: post.name,
          telphone: post.telphone,
          milkType: post.milkType,
          address: post.address,
          addressType: post.addressType,
          reserveTime: Moment(post.time).unix(),
          total: post.total,
          everyNum: post.everyNum,
          weekSendOut: post.weekSendOut,
          remarks: post.remarks
        });
      self.body = Common.suc({});
    }
  }

  //续卡
  async continuedCardAction() {
    let self = this;
    if (self.ctx.isPost) {
      let post = self.post();
      let userModel = self.model('user');
      let continuedCardModel = self.model('continued_card');
      let userData = await userModel
        .where({ id: post.userId })
        .field('id, total')
        .select();
      let totalMilkNum = parseInt(userData[0].total) + parseInt(post.addMilkNum);
      await userModel
        .where({ id: post.userId })
        .update({
          total: totalMilkNum
        });
      await continuedCardModel.add({
        isHidden: 1,
        generateTime: Moment().unix(),
        userId: post.userId,
        addMilkNum: post.addMilkNum,
        payee: post.payee,
        money: post.money,
        receivablesTime: Moment(post.time).unix()
      })
      self.body = Common.suc({});
    }
  }

  //退订
  async unsubscribeAction() {
    let self = this;
    if (self.ctx.isPost) {
      let post = self.post();
      let userModel = self.model('user');
      let unsubscribeModel = self.model('unsubscribe');
      await userModel
        .where({ id: post.userId })
        .update({
          isHidden: 0
        });
      await unsubscribeModel
        .add({
          isHidden: 1,
          generateTime: Moment().unix(),
          userId: post.userId,
          unsubscribeTime: Moment(post.time).unix(),
          unsubscribeReason: post.reason
        })
      self.body = Common.suc({});
    }
  }

  //加奶
  async addMilkAction() {
    let self = this;
    if (self.ctx.isPost) {
      let post = self.post();
      let mathMilkModel = self.model('math_milk');
      let productionModel = self.model('production');
      let userModel = self.model('user');
      //获取当前时间时间戳
      let time = self.post("time");
      //获得当前是周几
      let week = (new Date(Moment(post.time).unix() * 1000)).getDay() == '0' ? '7' : (new Date(Moment(post.time).unix() * 1000)).getDay();
      let productionData = await productionModel
        .where({ sendOutTime: Moment(post.time).unix() })
        .select();
      let mathMilkData = await mathMilkModel
        .where({ userId: post.userId, addMilkTime: Moment(post.time).unix(), operationType: 1 })
        .select();
      let userData = await userModel
        .where({ id: post.userId })
        .select();
      let defauleData = await userModel
        .where(`yb_xiangtian_user.id = ${post.userId} AND yb_xiangtian_user.weekSendOut LIKE '%${week}%'`)
        .select();

      //今天是派送时间
      if (defauleData.length) {
        let mathMilkData1 = await mathMilkModel
          .where({ userId: post.userId, addMilkTime: Moment(post.time).unix(), operationType: 0 })
          .select();
        if (mathMilkData1.length == 0) {
          self.body = Common.err('默认派送用户需要先减奶然后在进行加奶操作！');
          return false;
        }
      }
      if (mathMilkData.length != 0) {
        self.body = Common.err('今天此用户已经添加了加奶了，先去派单页删除在添加把！')
        return false;
      }
      //已经生成过数据
      if (productionData.length) {
        //生成得时候生成了这条了
        if (mathMilkData.length) {
          let productionData1 = await productionModel
            .where({ userId: post.userId, sendOutTime: Moment(post.time).unix() })
            .select();
          //更新user得消耗数
          await userModel
            .where({ id: post.userId })
            .update({
              consume: parseInt(userData[0].consume) - parseInt(productionData1[0].milkNum) + parseInt(post.milkNum)
            })
          await productionModel
            .where({ userId: post.userId, sendOutTime: Moment(post.time).unix() })
            .delete();
          //生成得时候没有这条 要添加一条新的
        } else {
          await userModel
            .where({ id: post.userId })
            .update({
              consume: parseInt(userData[0].consume) + parseInt(post.milkNum)
            });
        }
        await productionModel
          .add({
            isHidden: 1,
            generateTime: Moment().unix(),
            userId: post.userId,
            milkNum: post.milkNum,
            temporaryRemarks: post.remart,
            milkType: post.milkType,
            sendOutTime: Moment(post.time).unix()
          })
      }
      await mathMilkModel
        .where({
          addMilkTime: Moment(post.time).unix(),
          userId: post.userId,
          operationType: 1
        })
        .delete();
      await mathMilkModel
        .add({
          isHidden: 1,
          generateTime: Moment().unix(),
          userId: post.userId,
          operationType: 1,
          milkType: post.milkType,
          milkNum: post.milkNum,
          temporaryRemark: post.remart,
          addMilkTime: Moment(post.time).unix()
        });
      self.body = Common.suc({});
    }
  }

  //减奶
  async reduceMilkAction() {
    let self = this;
    if (self.ctx.isPost) {
      let post = self.post();
      let mathMilkModel = self.model('math_milk');
      let productionModel = self.model('production');
      let userModel = self.model('user');
      let week = (new Date(Moment(post.time).unix() * 1000)).getDay() == '0' ? '7' : (new Date(Moment(post.time).unix() * 1000)).getDay();
      let userData = await userModel
        .where({ id: post.userId })
        .select();
      if (userData[0].weekSendOut == '' || userData[0].weekSendOut.indexOf(week) < 0) {
        self.body = Common.err('今天没有默认配送，不需要减奶，直接加就行了！')
        return false;
      }
      let mathMilkData = await mathMilkModel
        .where({ userId: post.userId, addMilkTime: Moment(post.time).unix(), operationType: 0 })
        .select();
      if (mathMilkData.length) {
        self.body = Common.err('今天已经存在减奶了，去派单页删除了当天得在添加新的吧！')
        return false;
      }
      let productionData = await productionModel
        .where({ sendOutTime: Moment(post.time).unix() })
        .select();
      //有数据 说明已经生成过了
      if (productionData.length) {
        let productionData1 = await productionModel
          .where({ userId: post.userId, sendOutTime: Moment(post.time).unix() })
          .select();
        await userModel
          .where({ id: post.userId })
          .update({
            consume: parseInt(userData[0].consume) - parseInt(productionData1[0].milkNum)
          });
        await productionModel
          .where({ userId: post.userId, sendOutTime: Moment(post.time).unix() })
          .delete();
        await mathMilkModel
          .add({
            isHidden: 1,
            generateTime: Moment().unix(),
            userId: post.userId,
            operationType: 0,
            milkType: 1,
            milkNum: 1,
            temporaryRemark: '',
            addMilkTime: Moment(post.time).unix()
          });
        self.body = Common.suc({});
        //没有数据 没有生成过
      } else {
        await mathMilkModel
          .where({
            addMilkTime: Moment(post.time).unix(),
            userId: post.userId
          })
          .delete();
        await mathMilkModel
          .add({
            isHidden: 1,
            generateTime: Moment().unix(),
            userId: post.userId,
            operationType: 0,
            milkType: 1,
            milkNum: 1,
            temporaryRemark: '',
            addMilkTime: Moment(post.time).unix()
          });
        self.body = Common.suc({});
      }
    }
  }

  //删除加减奶
  async delMathMilkAction() {
    let self = this;
    if (self.ctx.isPost) {
      let mathMilkModel = self.model('math_milk');
      let productionModel = self.model('production');
      let userModel = self.model('user');
      let post = self.post();
      let time = self.post('time') == '' || self.post('time') == undefined ? Moment().year() + "-" + (Moment().month() + 1) + "-" + Moment().date() : self.post('time');
      let productionNum = await productionModel
        .where({ sendOutTime: Moment(time).unix() })
        .field('milkNum')
        .select();
      let userData = await userModel
        .where({ id: post.id })
        .select();
      let addMathMilkData = await mathMilkModel
        .where({ userId: post.id, addMilkTime: Moment(time).unix(), operationType: 1 })
        .select();
      let delMathMilkData = await mathMilkModel
        .where({ userId: post.id, addMilkTime: Moment(time).unix(), operationType: 0 })
        .select();
      //已经生成过数据了 大于0条
      if (productionNum.length) {
        //加奶
        if (post.type == 1) {
          await userModel
            .where({ id: post.id })
            .update({
              consume: userData[0].consume - addMathMilkData[0].milkNum
            });
          await productionModel
            .where({ userId: post.id, sendOutTime: Moment(time).unix() })
            .delete();
          //减奶
        } else {
          //只有删除 没有增加
          if (addMathMilkData.length == 0) {
            await userModel
              .where({ id: post.id })
              .update({
                consume: userData[0].consume + userData[0].everyNum
              });
            await productionModel
              .add({
                isHidden: 1,
                generateTime: Moment().unix(),
                userId: post.id,
                milkNum: userData[0].everyNum,
                temporaryRemarks: '',
                milkType: userData[0].milkType,
                sendOutTime: Moment(time).unix()
              });
            //既有删除又有增加
          } else {
            await userModel
              .where({ id: post.id })
              .update({
                consume: userData[0].consume + delMathMilkData[0].milkNum - addMathMilkData[0].milkNum
              });
            await productionModel
              .where({ userId: post.id, sendOutTime: Moment(time).unix() })
              .delete();
            await productionModel
              .add({
                isHidden: 1,
                generateTime: Moment().unix(),
                userId: post.id,
                milkNum: userData[0].everyNum,
                temporaryRemarks: '',
                milkType: userData[0].milkType,
                sendOutTime: Moment(time).unix()
              });
            await mathMilkModel
              .where({ userId: post.id, addMilkTime: Moment(time).unix(), operationType: 1 })
              .delete();
          }
        }
      }
      await mathMilkModel
        .where({ userId: post.id, addMilkTime: Moment(time).unix(), operationType: post.type })
        .delete();
      //self.body = productionNum;
      self.body = Common.suc({});
    }
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

  //添加数字地址
  async numberAddressAction() {
    let self = this;
    if (self.ctx.isPost) {
      let addressNumberModel = self.model('address_number');
      let post = self.post();
      let addressNumberData = await addressNumberModel
        .where({ number: post.number })
        .select();
      if (addressNumberData.length) {
        self.body = Common.err('该数字被使用了，换一个吧！');
        return false;
      }
      await addressNumberModel
        .add({
          isHidden: 1,
          generateTime: Moment().unix(),
          number: post.number,
          address: post.address
        });
      self.body = Common.suc({});
    }
  }

  //删除添加数字
  async delNumberAddressAction() {
    let self = this;
    let numberAddressModel = self.model('address_number');
    await numberAddressModel
      .where({ id: self.get('id') })
      .delete();
    self.body = Common.suc({});
  }

  //发生的错误
  async errAction(){
    let self = this;
    if(self.ctx.isPost){
      let errModel = self.model('err');
      let post = self.post();
      await errModel
        .add({
          isHidden: 1,
          generateTime: Moment().unix(),
          url: post.url,
          parame: post.parame
        })
      self.body = Common.suc({});
    }  
  }
};
