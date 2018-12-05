var ybUtils = {
    ybGet: function (url, fn) {
        $.ajax({
            type: "GET",
            timeout: 5000, //超时时间设置，单位毫秒
            url: url,
            dataType: "json",
            success: function (data) {
                if (data.isOk == 1) {
                    fn(data);
                } else {
                    check = true;
                    console.log(check)
                    alert(data.msg)
                }

            },
            error: function (e) {
                check = true;
                alert('服务器错误');
            }
        });
    },
    ybPost: function (url, parame, fn) {
        $.ajax({
            type: "POST",
            timeout: 5000, //超时时间设置，单位毫秒
            url: url,
            data: parame,
            dataType: "json",
            success: function (data) {
                if (data.isOk == 1) {
                    fn(data);
                } else {
                    check = true;
                    alert(data.msg)
                }
            },
            error: function (e) {
                check = true;
                alert('服务器错误')
            }
        });
    },
    getUrl: function (variable) {
        var query = decodeURI(decodeURI(window.location.search)).substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) { return pair[1]; }
        }
        return ('');
    },
    //打点
    ybLog: function (userId, logId) {
        this.ybGet(`/api/log?userId=${userId}&logId=${logId}`, function () { });
    },
    //异步加载js
    loadJS: function (url) {
        if (window.top == self) {
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = url;
            var tmp = document.getElementsByTagName("script")[0];
            tmp.parentNode.appendChild(s);
        }
    }
}