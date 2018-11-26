(function () {
    $(function () {
        ybUtils.ybLog(cId, 24); 
        let id;
        let time = ybUtils.getUrl('time');
        if (time != "") {
            $("#time").attr('value', time);
        }
        $(".header ul li:eq(1)").addClass('active');
        $(".del").on('click', function () {
            ybUtils.ybLog(cId, 27); 
            id = $(this).attr('data-id');
            let type = $(this).attr('data-type');
            let c = confirm('是否确认删除？');
            if (c) {
                ybUtils.ybGet('/api/delMathMilk?id=' + id + '&time=' + time + '&type=' + type, function () {
                    ybUtils.ybLog(cId, 28); 
                    window.location.href = window.location.href;
                })
            }
        })
        $("#query").on('click', function () {
            let time = $("#time").val();
            if (time == "") return false;
            ybUtils.ybLog(cId, 25); 
            window.location.href = '/xiangtian/sendOut?time=' + time;
        })
        $("#generate").on("click", function () {
            ybUtils.ybPost('/api/generateSendOut', { time: time, data: $("#data").val() }, function (data) {
                var jsono = [];
                var ybData = JSON.parse($("#data").val());
                for (var i = 0; i < ybData.length; i++) {
                    var obj = {
                        "id": ybData[i].id,
                        "姓名": ybData[i].name,
                        "送奶杯数": ybData[i].milkNum,
                        "送奶种类": ybData[i].milkType,
                        "临时备注": ybData[i].temporaryRemark,
                        "电话": ybData[i].telphone,
                        "订奶种类": ybData[i].typeName,
                        "地址": ybData[i].address,
                        "订购日期": ybData[i].reserveTime,
                        "总数（瓶）": ybData[i].total,
                        "消耗（瓶）": ybData[i].consume,
                        "剩余（瓶）": ybData[i].total - ybData[i].consume,
                        "每天杯数": ybData[i].everyNum,
                        "周几送": ybData[i].weekSendOut,
                        "备注": ybData[i].remarks,
                    }
                    jsono.push(obj);
                }
                var allMilk = JSON.parse($("#allMilk").val());
                jsono.push({
                    "id": '汇总：',
                    "姓名": '巴氏奶（大）-' + allMilk[0] + '瓶',
                    "送奶杯数": '巴氏奶（小）-' + allMilk[1] + '瓶',
                    "送奶种类": '酸（大）-' + allMilk[2] + '瓶',
                    "临时备注": '酸（小）-' + allMilk[3] + '瓶',
                    "电话": '',
                    "订奶种类": '',
                    "地址": '',
                    "订购日期": '',
                    "总数（瓶）": '',
                    "消耗（瓶）": '',
                    "剩余（瓶）": '',
                    "每天杯数": '',
                    "周几送": '',
                    "备注": '',
                });
                ybUtils.ybLog(cId, 26); 
                downloadExl(jsono);
            });
        });
        var tmpDown; //导出的二进制对象
        function downloadExl(json, type) {
            var tmpdata = json[0];
            json.unshift({});
            var keyMap = []; //获取keys
            //keyMap =Object.keys(json[0]);
            for (var k in tmpdata) {
                keyMap.push(k);
                json[0][k] = k;
            }
            var tmpdata = [];//用来保存转换好的json 
            json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
                v: v[k],
                position: (j > 25 ? getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
            }))).reduce((prev, next) => prev.concat(next)).forEach((v, i) => tmpdata[v.position] = {
                v: v.v
            });
            var outputPos = Object.keys(tmpdata); //设置区域,比如表格从A1到D10
            var tmpWB = {
                SheetNames: ['mySheet'], //保存的表标题
                Sheets: {
                    'mySheet': Object.assign({},
                        tmpdata, //内容
                        {
                            '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] //设置填充区域
                        })
                }
            };
            tmpDown = new Blob([s2ab(XLSX.write(tmpWB,
                { bookType: (type == undefined ? 'xlsx' : type), bookSST: false, type: 'binary' }//这里的数据是用来定义导出的格式类型
            ))], {
                    type: ""
                }); //创建二进制对象写入转换好的字节流
            var href = URL.createObjectURL(tmpDown); //创建对象超链接
            document.getElementById("hf").href = href; //绑定a标签
            document.getElementById("hf").click(); //模拟点击实现下载
            setTimeout(function () { //延时释放
                URL.revokeObjectURL(tmpDown); //用URL.revokeObjectURL()来释放这个object URL
            }, 100);
        }

        function s2ab(s) { //字符串转字符流
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
        function getCharCol(n) {
            let temCol = '',
                s = '',
                m = 0
            while (n > 0) {
                m = n % 26 + 1
                s = String.fromCharCode(m + 64) + s
                n = (n - m) / 26
            }
            return s
        }
    });
})();