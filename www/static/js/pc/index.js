(function () {
    $(function () {
        let name = ybUtils.getUrl("name");
        let start = ybUtils.getUrl("start");
        let end = ybUtils.getUrl("end");
        let id; //操作的id
        if (name != "") {
            console.log()
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
            window.location.href = "/xiangtian/summary";
        })
        $("#query").on("click", function () {
            let userName = $("#userName").val();
            let start = $("#start").val();
            let end = $("#end").val();
            if (userName == "" && start == "" && end == "") return false;
            window.location.href = `/xiangtian/index?name=${encodeURI(userName)}&start=${start}&end=${end}`;
        });
        $("#handleCard").on("click", function () {
            $("#handleCardAlert").show();
        });
        $(".close, .yb-close").on("click", function () {
            clearData();
            $(".yb-mask").hide();
        });
        $("#handleAdd").on("click", function () {
            let name = $("#bcName").val();
            if (name == "") {
                alert("请填写姓名");
                return false;
            }
            let telphone = $("#bcTelphone").val();
            if (telphone == "") {
                alert("请填写电话");
                return false;
            }
            let milkType = $("#bcMilkType").val();
            let address = $("#bcAddress").val();
            if (address == "") {
                alert("请填写地址");
                return false;
            }
            let addressType = $("#bcAddressType").val();
            if (addressType == "") {
                alert("请填写地址数字");
                return false;
            }
            let recerveTime = $("#bcRecerveTime").val();
            if (recerveTime == "") {
                alert("请填写定卡日期");
                return false;
            }
            let total = $("#bcTotal").val();
            if (total == "") {
                alert("请填写总瓶数");
                return false;
            }
            let id_list = "";
            $('input:checkbox[name=bcWeekSendOut]:checked').each(function () {
                id_list += $(this).attr('value') + ',';
            });
            if (id_list == "") {
                alert("请填写周几送");
                return false;
            }
            if (id_list.indexOf("0") >= 0 && id_list.length > 2) {
                alert("周几和打电话不能重复");
                return false;
            }
            let weekSendOut;
            if(id_list.length <= 2 && id_list.indexOf("0") >= 0){
                weekSendOut = ""
            }else{
                weekSendOut = "[" + id_list.substring(0, id_list.length - 1) + "]";
            }
            let everyNum = $("#bcEveryNum").val();
            let remarks = $("#bcRemarks").val();
            ybUtils.ybGet(`/api/addUser?name=${name}&telphone=${telphone}&milkType=${milkType}&address=${address}&addressType=${addressType}&total=${total}&weekSendOut=${weekSendOut}&remarks=${remarks}&everyNum=${everyNum}`, function () {
                window.location.href = window.location.href;
            });
        });
        $(".xuka").on('click', function(){
            id = $(this).parent().attr('data-id');
            $("#continued-card").show();
        });
        $(".tuiding").on('click', function(){
            id = $(this).parent().attr('data-id');
            $("#unsubscribe").show();
        });
        $(".jianai").on('click', function(){
            id = $(this).parent().attr('data-id');
            $("#addMilk").show();
        })
        $(".jiannai").on('click', function(){
            id = $(this).parent().attr('data-id');
            $("#reduceMilk").show();
        })
        function clearData() {
            $("#bcName, #bcTelphone, #bcAddress, #bcAddressType, #bcTotal, #bcEveryNum, #bcRemarks, #milkNum, #money, #payee").val('');
            $("#bcMilkType").val(1)
            $("#bcRecerveTime, #receivablesTime").attr('value', "");
            $('input:checkbox[name=bcWeekSendOut]:checked').each(function () {
                $(this).attr("checked", false);
            });
        }
    });
})();