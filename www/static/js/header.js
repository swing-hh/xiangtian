$(".header ul li").on('click', function () {
    window.location.href = $(this).attr('data-url');
});
$(".header button").on('click', function () {
    ybUtils.ybLog(cId, 21);
    setTimeout(function () {
        ybUtils.ybGet('/api/exitLogin', function () {
            window.location.href = '/xiangtian/login';
        });
    }, 100)
});
var cId = $("#cookie").val();