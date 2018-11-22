(function () {
    $(function () {
        let id;
        let time = ybUtils.getUrl('time');
        if (time != "") {
            $("#time").attr('value', time);
        }
        $(".header ul li:eq(1)").addClass('active');
        $(".del").on('click', function () {
            id = $(this).attr('data-id');
            let c = confirm('是否确认删除？');
            if (c) {
                ybUtils.ybGet('/api/delMathMilk?id=' + id, function () {
                    window.location.href = window.location.href;
                })
            }
        })
        $("#query").on('click', function () {
            let time = $("#time").val();
            if (time == "") return false;
            window.location.href = '/xiangtian/sendOut?time=' + time;
        })
        $("#generateExcel").on("click", function () {
            ybUtils.ybPost('/api/generateSendOut', {time: '2018-11-22', data: $("#ybData").val()},function(data){
                console.log(data)
                // window.location.href = data;
            }); 
        });
    });
})();