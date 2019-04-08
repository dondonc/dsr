nie.define('Index', () => {

    // DSR
    let dsrFun = {
        resources: [
            __CDNPATH + '/assets/theme0.json',
            __CDNPATH + '/assets/theme1.json',
            __CDNPATH + '/assets/theme2.json'
        ],
        init() {
            let self = this
            return new DSR({
                id: "#canvas-box", //canvas父容器id，用于插入canvas画布【必传】
                btns: ".btn", //按钮className【必传】
                width: 650, //canvas width【必传】
                height: 490, //canvas height【必传】
                resources: self.resources, //图片资源【必传】
                basicScale: 0.8, // 默认物件图缩放比例，用于适配移动端 【选传】不传默认为：1（不缩放）
                basicDirection: 'flip', // 默认物件图水平方向 【选传】不传默认为：default（不翻转）可选值【default，flip】
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

    //更新按钮
    let btnsArr = [
        ["00090.png", "01110.png", "01120.png", "02140.png", "02150.png", "03080.png", "04130.png", "04140.png", "04150.png", "05080.png", "06100.png", "07070.png", "08210.png", "08220.png", "08230.png", "061120.png"],
        ["00070.png", "00080.png", "01090.png", "01100.png", "02110.png", "02120.png", "03060.png", "04100.png", "04110.png", "04120.png", "05070.png", "06080.png", "08180.png", "08190.png", "08200.png", "44171.png", "060920.png"],
        ["00120.png", "00130.png", "00140.png", "01150.png", "01160.png", "01170.png", "01180.png", "02180.png", "02190.png", "02200.png", "02210.png", "02220.png", "03100.png", "03110.png", "04190.png", "04200.png", "04210.png", "04220.png", "04230.png", "04240.png", "05100.png", "05110.png", "05120.png", "06140.png", "06160.png", "07080.png", "07090.png", "07100.png", "08270.png", "08280.png", "08290.png", "08300.png", "08310.png", "08320.png", "08330.png", "08350.png", "08360.png", "061511.png", "061711.png"]
    ]
    let undateBtns = (index) => {
        let btns = btnsArr[index],
            _h = ``;

        for (let i = 0; i < btns.length; i++) {
            _h += `<button class="btn" data-name="${btns[i]}">${btns[i]}</button>`
        }
        $(".wj-btn").empty().append(_h);
    }
    undateBtns(0);

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
            undateBtns(_i);
        })

        //清空当前画面内容
        $(".btn-clean").on('click', function () {
            _dsr.clean();
        })
    };

    pageEvent();
})