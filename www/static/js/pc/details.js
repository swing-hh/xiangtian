(function(){
    $(function(){
        $("#update").on("click", function(){
            $("#userInfo").show();
        });
        $(".close, .yb-close").on('click', function(){
            $("#userInfo").hide();
        });
    });
})();