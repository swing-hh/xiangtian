(function(){
    $(function(){
        let startTime = ybUtils.getUrl('start');
        $('.start').attr('value', startTime);
        let endTime = ybUtils.getUrl('end');
        $('.end').attr('value', endTime);
        $("#query").on('click', function(){
            let start = $('.start').val();
            let end = $('.end').val();
            window.location.href = `/xiangtian/summary?start=${start}&end=${end}`;
        });
        $('#generate').on('click', function(){
            alert('shengc')
        })
    });
})();