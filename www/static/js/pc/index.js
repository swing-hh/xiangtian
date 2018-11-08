(function(){
    $(function(){
        $(".header ul li:eq(0)").addClass('active');
        $("#shengcheng").on("click", function(){
            window.location.href = "/xiangtian/summary";
        })
    });
})();