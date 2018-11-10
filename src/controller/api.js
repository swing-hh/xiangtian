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
        path: '/xiangtian'
      });
      self.cookie('name', `${data[0].name}`, { // 设定 cookie 时指定额外的配置
        maxAge: 24 * 3600 * 1000,
        path: '/xiangtian'
      })
      self.body = Common.suc(data[0]);
    } else {
      self.body = Common.err("账号或密码错误");
    }
  }

  //添加用户
  async addUserAction(){
    let self = this;
    let userModel = self.model('user');
    let get = self.get();
    let remarks = get.remarks == undefined || get.remarks == ''?"":get.remarks;
    let everyNum = get.everyNum == undefined || get.everyNum == ""?0:get.everyNum;
    await userModel.add({
      isHidden: 1,
      generateTime: Moment().unix(),
      name: get.name,
      telphone: get.telphone,
      milkType: get.milkType,
      address: get.address,
      addressType: get.addressType,
      reserveTime: Moment(get.reserveTime).unix(),
      total: get.total,
      consume: 0,
      weekSendOut: get.weekSendOut,
      remarks: remarks,
      everyNum: everyNum
    });
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
};
