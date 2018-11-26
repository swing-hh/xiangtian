module.exports = {
    isPc: function (self) {
        let ua = self.ctx.headers["user-agent"].toLowerCase();;
        var agentID = ua.match(/(iphone|ipod|ipad|android)/);
        //手机端pad
        if (agentID) {
            return false;
        } else {
            return true;
        }
    },
    suc: function (data) {
        return {
            isOk: 1,
            message: '成功',
            data: data
        }
    },
    err: function (msg = "错误") {
        return {
            isOk: 0,
            msg: msg
        }
    },
    isLogin: function (self) {
        if (self.cookie("id") == undefined) {
            self.ctx.redirect('/xiangtian/login');
        } else {
            return true;
        }
    },
    getDay: function () {

    },
    fmtDate: function (num) {
        var date = new Date(num);
        var y = (1900 + date.getYear()).toString();
        var m = "0" + (date.getMonth() + 1);
        var d = "0" + date.getDate();
        return y.substring(2,4) + "/" + m.substring(m.length - 2, m.length) + "/" + d.substring(d.length - 2, d.length);
    }
}