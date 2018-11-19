(function () {
    $(function () {
        $("#update").on("click", function () {
            let weekSendOut = $("#weekSendOut").text();
            let week = JSON.parse(weekSendOut);
            for (var i = 0; i < week.length; i++) {
                alert(week[i])
            }
            $("#userInfo").show();
        });
        $(".close, .yb-close").on('click', function () {
            $("#userInfo").hide();
        });
    });
})();