(function () {
    $(function () {
        var cId = 0;
        ybUtils.ybLog(cId, 1);
        $("#name").focus();
        $("#login").on('click', function () {
            login();
        });

        document.onkeydown = function (event) {
            if (event.keyCode == 13) {
                login();
            }
        };
        //提交数据
        function login() {
            let name = $("#name").val();
            if (name == "") return false;
            let pwd = $("#pwd").val();
            if (pwd == "") return false;
            $.ajax({
                type: "GET",
                timeout: 2000, //超时时间设置，单位毫秒
                url: `/api/login?name=${name}&pwd=${pwd}`,
                dataType: "json",
                success: function (data) {
                    if (data.isOk == 1) {
                        ybUtils.ybLog(cId, 2);
                        window.location.href = "/xiangtian"
                    } else {
                        err(data.msg);
                    }
                },
                error: function (e) {
                    err(e.message)
                }
            });
        }
        //错误
        function err(msg) {
            $("#name").val("");
            $("#pwd").val("");
            $("#yb-alert p").text(msg);
            $("#yb-alert").show();
            $("#name").focus();
            setTimeout(function () {
                $("#yb-alert").hide();
            }, 2000);
        }
    });
})();