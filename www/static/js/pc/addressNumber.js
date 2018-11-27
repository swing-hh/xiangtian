(function () {
    $(function () {
        ybUtils.ybLog(cId, 35);
        $(".header ul li:eq(4)").addClass('active');
        $(".close, .yb-close").on("click", function () {
            ybUtils.ybLog(cId, 6);
            clearData();
            $(".yb-mask").hide();
        });
        $("#add").on('click', function () {
            ybUtils.ybLog(cId, 36);
            $(".yb-mask").show();
        })
        function clearData() {
            $(".yb-mask input").val('');
        }
        //增加
        $(".yb-mask .add").on('click', function () {
            let number = $(".yb-mask .number").val();
            if (number == '') {
                alert('数字不能为空');
                return false;
            }
            let address = $(".yb-mask .address").val();
            if (address == '') {
                alert('区域不能为空');
                return false;
            }
            ybUtils.ybPost(`/api/numberAddress`, {
                number: number,
                address: address
            }, function () {
                ybUtils.ybLog(cId, 37);
                window.location.href = window.location.href;
            })
        })
        $(".del").on('click', function () {
            ybUtils.ybLog(cId, 38);
            let id = $(this).attr('data-id');
            let c = confirm('确定删除这条数字地址嘛？')
            if (c) {
                ybUtils.ybGet(`/api/delNumberAddress?id=${id}`, function () {
                    ybUtils.ybLog(cId, 39);
                    window.location.href = window.location.href;
                });
            }
        });
    });
})()