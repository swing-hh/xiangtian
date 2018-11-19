(function(){
    $(function(){
        let start = ybUtils.getUrl("start");
        let end = ybUtils.getUrl("end");
        $(".header ul li:eq(3)").addClass('active');
        $("#query").on('click', function () {
            let start = $("#start").val();
            let end = $("#end").val();
            window.location.href = '/xiangtian/unsubscribe?start=' + start + '&end=' + end;
        });
        $("#start").attr('value', start);
        $("#end").attr('value', end);
    });
})();