let check = true;
(function () {
    $(function () {
        ybUtils.ybLog(cId, 3); 
        let name = ybUtils.getUrl("name");
        let start = ybUtils.getUrl("start");
        let end = ybUtils.getUrl("end");
        let id; //操作的id
        if (name != "") {
            $("#userName").val(name);
        }
        if (start != "") {
            $("#start").attr("value", start);
        }
        if (end != "") {
            $("#end").attr("value", end);
        }
        $(".header ul li:eq(0)").addClass('active');
        $("#shengcheng").on("click", function () {
            ybUtils.ybLog(cId, 17); 
            window.location.href = "/xiangtian/summary";
        })
        $("#query").on("click", function () {
            let userName = $("#userName").val();
            let start = $("#start").val();
            let end = $("#end").val();
            if (userName == "" && start == "" && end == "") return false;
            ybUtils.ybLog(cId, 7); 
            window.location.href = `/xiangtian/index?name=${encodeURI(userName)}&start=${start}&end=${end}`;
        });
        $("#handleCard").on("click", function () {
            ybUtils.ybLog(cId, 4); 
            $("#handleCardAlert").show();
        });
        $(".close, .yb-close").on("click", function () {
            ybUtils.ybLog(cId, 6); 
            clearData();
            $(".yb-mask").hide();
        });
        //办卡
        $("#handleCardAlert .add").on("click", function () {
            let name = $("#handleCardAlert .name").val();
            if (name == "") {
                alert("请填写姓名!");
                return false;
            }
            let telphone = $("#handleCardAlert .telphone").val();
            if (telphone == "") {
                alert("请填写电话!");
                return false;
            }
            let milkType = $("#handleCardAlert .milkType").val();
            let address = $("#handleCardAlert .address").val();
            if (address == "") {
                alert("请填写地址!");
                return false;
            }
            let addressType = $("#handleCardAlert .addressType").val();
            if (addressType == "") {
                alert("请填写地址数字!");
                return false;
            }
            let time = $("#handleCardAlert .time").val();
            if (time == "") {
                alert("请填写办卡时间!");
                return false;
            }
            let total = $(".total").val();
            if (total == "") {
                alert("请填写总瓶数!");
                return false;
            }
            let id_list = "";
            $('input:checkbox[name=bcWeekSendOut]:checked').each(function () {
                id_list += $(this).attr('value') + ',';
            });
            if (id_list == "") {
                alert("请填写周几送!");
                return false;
            }
            if (id_list.indexOf("0") >= 0 && id_list.length > 2) {
                alert("周几和打电话不能重复!");
                return false;
            }
            let weekSendOut;
            if (id_list.length <= 2 && id_list.indexOf("0") >= 0) {
                weekSendOut = ""
            } else {
                weekSendOut = "[" + id_list.substring(0, id_list.length - 1) + "]";
            }
            let everyNum = $("#handleCardAlert .everyNum").val();
            let remarks = $("#handleCardAlert .remark").val();
            if (!check) return false;
            check = false;
            ybUtils.ybGet(`/api/addUser?name=${name}&telphone=${telphone}&milkType=${milkType}&address=${address}&addressType=${addressType}&time=${time}&total=${total}&weekSendOut=${weekSendOut}&remarks=${remarks}&everyNum=${everyNum}`, function(){
                ybUtils.ybLog(cId, 5); 
                window.location.href = window.location.href;
            })

        });
        $(".xuka").on('click', function () {
            id = $(this).parent().attr('data-id');
            $("#continued-card").show();
            ybUtils.ybLog(cId, 8); 
        });
        $(".tuiding").on('click', function () {
            id = $(this).parent().attr('data-id');
            ybUtils.ybLog(cId, 10); 
            $("#unsubscribe").show();
        });
        $(".jianai").on('click', function () {
            id = $(this).parent().attr('data-id');
            ybUtils.ybLog(cId, 12); 
            $("#addMilk").show();
        })
        $(".jiannai").on('click', function () {
            id = $(this).parent().attr('data-id');
            ybUtils.ybLog(cId, 14); 
            $("#reduceMilk").show();
        })
        $(".chakan-xiangqing").on('click', function(){
            ybUtils.ybLog(cId, 16); 
        })
        //续卡
        $("#continued-card .add").on('click', function () {
            let milkNum = $("#continued-card .milkNum").val();
            if (milkNum == "") {
                alert('请填写增加瓶数!');
                return false;
            }
            let money = $("#continued-card .money").val();
            if (money == "") {
                alert('请填写金额!');
                return false;
            }
            let payee = $("#continued-card .payee").val();
            if (payee == "") {
                alert('请填写收款人!');
                return false;
            }
            let time = $("#continued-card .time").val();
            if (time == "") {
                alert('请填写收款时间!');
                return false;
            }
            if (!check) return false;
            check = false;
            ybUtils.ybLog(cId, 9); 
            window.location.href = `/api/continuedCard?userId=${id}&addMilkNum=${milkNum}&money=${money}&payee=${payee}&time=${time}`;
        });
        //退卡
        $("#unsubscribe .add").on('click', function () {
            let time = $("#unsubscribe .time").val();
            if (time == "") {
                alert('请填写退订时间!');
                return false;
            }
            let reason = $("#unsubscribe .reason").val();
            if (!check) return false;
            check = false;
            ybUtils.ybLog(cId, 11); 
            window.location.href = `/api/unsubscribe?userId=${id}&time=${time}&reason=${reason}`;
        });
        //加奶
        $("#addMilk .add").on('click', function () {
            let time1 = $("#addMilk .time").val();
            if (time1 == "") {
                alert('请填写加奶时间!');
                return false;
            }
            let milkNum = $("#addMilk .milkNum").val();
            if (milkNum == "") {
                alert('请填写加奶数量!');
                return false;
            }
            let milkType = $("#addMilk .milkType").val();
            if (milkType == "") {
                alert('请填写加奶类型!');
                return false;
            }
            let remart = $("#addMilk .remart").val();
            if (!check) return false;
            check = false;
            ybUtils.ybLog(cId, 13); 
            ybUtils.ybGet(`/api/addMilk?userId=${id}&time=${time1}&milkNum=${milkNum}&milkType=${milkType}&remart=${remart}`, function () {
                window.location.href = window.location.href;
            })
        });
        //减奶
        $("#reduceMilk .add").on('click', function () {
            let time = $("#reduceMilk .time").val();
            if (time == "") {
                alert('请填写退订时间!');
                return false;
            }
            if (!check) return false;
            check = false;
            ybUtils.ybLog(cId, 15);
            ybUtils.ybGet(`/api/reduceMilk?userId=${id}&time=${time}`, function () {
                window.location.href = window.location.href;
            });
        });
        function clearData() {
            $(".name, .telphone, .address, .addressType, .total, .everyNum, .remark, .milkNum, .money, .payee, .reason, .remart").val('');
            $(".milkType").val(1)
            $(".time, .receivablesTime").attr('value', "");
            $('input:checkbox[name=bcWeekSendOut]:checked').each(function () {
                $(this).attr("checked", false);
            });
        }
    });
})();