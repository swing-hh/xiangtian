let check = true;
(function () {
    $(function () {
        ybUtils.ybLog(cId, 18); 
        let userId = ybUtils.getUrl('id');
        $("#update").on("click", function () {
            let weekSendOut = $("#weekSendOut").text();
            let week = weekSendOut == "" ? '' : JSON.parse(weekSendOut);
            if (week == '') {
                $('input:checkbox[name=bcWeekSendOut]:eq(7)').attr('checked', true);
            } else {
                for (var i = 0; i < week.length; i++) {
                    $('input:checkbox[name=bcWeekSendOut]:eq(' + (week[i] - 1) + ')').attr('checked', true);
                }
            }
            ybUtils.ybLog(cId, 19); 
            $("#handleCardAlert").show();
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
            ybUtils.ybLog(cId, 20); 
            ybUtils.ybGet(`/api/updateUser?userId=${userId}&name=${name}&telphone=${telphone}&milkType=${milkType}&address=${address}&addressType=${addressType}&time=${time}&total=${total}&weekSendOut=${weekSendOut}&remarks=${remarks}&everyNum=${everyNum}`, function(){
                window.location.href =  window.location.href;
            });
        });
        $(".close, .yb-close").on('click', function () {
            ybUtils.ybLog(cId, 6); 
            $("#handleCardAlert").hide();
        });
    });
})();