nie.define('Index', () => {

    // DSR
    let dsrFun = {
        resources: [
            __CDNPATH + '/assets/theme0.json',
            __CDNPATH + '/assets/theme1.json'
        ],
        init() {
            let self = this
            return new DSR({
                id: "#canvas-box", //canvas父容器id，用于插入canvas画布【必传】
                btns: ".btn", //按钮className【必传】
                width: 650, //canvas width【必传】
                height: 490, //canvas height【必传】
                resources: self.resources, //图片资源【必传】
                basicScale: .5, // 默认物件图缩放比例，用于适配移动端 【选传】不传默认为：1（不缩放）
                // bgColor: '#42496b', //画布背景色，选传，默认白色#fff【选传】
                onChange: function () {
                    //切换主题时执行的回调
                    console.log('chaaaaaaaange!');
                },
                onInit: function () { //【选传】
                    //初始化完成回调
                    console.log('init complete!');
                },
                onLoad: function (loader, resource) {
                    console.log("loading -- " + loader.progress.toFixed(0) + '%');
                },
                onLoaded: function () {
                    console.log('resource loaded!');
                }
            })
        }
    };

    let _dsr = dsrFun.init();
    // console.log(_dsr);

    // 页面事件
    let pageEvent = () => {
        //切换主题
        $(".theme-btn").on('click', function () {
            let _i = $(this).data('theme');

            if (_dsr.loading) {
                console.log('正在加载资源，请稍等')
                return;
            }
            $(this).addClass('act').siblings().removeClass('act');
            //切换主题
            _dsr.change(dsrFun.resources[_i]);
        })

        //清空当前画面内容
        $(".btn-clean").on('click', function () {
            _dsr.clean();
        })
    };

    pageEvent();
})