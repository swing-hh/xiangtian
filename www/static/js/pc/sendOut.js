(function () {
    $(function () {
        let id;
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
    });
})();