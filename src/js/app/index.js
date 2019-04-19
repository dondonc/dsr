nie.define('Index', () => {

    // DSR
    let dsrFun = {
        resources: [
            __CDNPATH + '/assets/theme0.json',
            __CDNPATH + '/assets/theme1.json',
            __CDNPATH + '/assets/theme2.json',
            __CDNPATH + '/assets/theme3.json',
            __CDNPATH + '/assets/theme4.json',
            __CDNPATH + '/assets/theme5.json',
            __CDNPATH + '/assets/theme6.json',
            __CDNPATH + '/assets/theme7.json',
            __CDNPATH + '/assets/theme8.json',
            __CDNPATH + '/assets/theme9.json',
            __CDNPATH + '/assets/theme10.json',
            __CDNPATH + '/assets/theme11.json'
        ],
        init() {
            let self = this
            return new DSR({
                id: "#canvas-box", //canvas父容器id，用于插入canvas画布【必传】
                btns: ".btn", //按钮className【必传】
                width: 650, //canvas width【必传】650
                height: 490, //canvas height【必传】490
                resources: self.resources, //图片资源【必传】
                basicScale: 0.35, // 默认物件图缩放比例，用于适配移动端 【选传】不传默认为：1（不缩放）
                limitOnce: false, // 是否限制只能添加一次家具【选传】默认值false（不限制）
                // basicDirection: 'flip', // 默认物件图水平方向 【选传】不传默认为：default（不翻转）可选值【default，flip】
                // bgColor: '#42496b', //画布背景色，选传，默认透明【选传】
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
        ["00091.png", "01111.png", "01121.png", "02141.png", "02151.png", "03080.png", "04131.png", "04141.png", "04151.png", "05081.png", "06101.png", "07071.png", "08210.png", "08221.png", "08231.png", "061120.png"],
        ["00071.png", "00081.png", "01090.png", "01101.png", "02110.png", "02121.png", "03060.png", "04101.png", "04111.png", "04121.png", "05071.png", "06080.png", "08181.png", "08190.png", "08201.png", "060920.png"],
        ["00151.png", "00161.png", "01191.png", "01200.png", "02231.png", "03121.png", "03130.png", "04251.png", "04260.png", "05130.png", "06191.png", "07111.png", "07120.png", "08371.png", "08381.png", "08391.png", "08400.png", "08411.png", "08421.png", "08431.png", "08440.png", "061821.png"],
        ["00101.png", "00111.png", "01130.png", "01141.png", "02161.png", "02171.png", "03090.png", "04161.png", "04171.png", "04181.png", "05091.png", "06121.png", "08241.png", "08251.png", "08261.png", "061320.png"],
        ["00121.png", "00131.png", "01150.png", "01161.png", "02181.png", "02191.png", "03100.png", "04191.png", "04201.png", "04211.png", "05101.png", "06141.png", "08270.png", "08280.png", "08290.png", "061511.png"],
        ["00141.png", "01171.png", "01180.png", "02201.png", "02211.png", "02221.png", "03110.png", "04221.png", "04231.png", "04240.png", "05111.png", "05121.png", "06161.png", "07081.png", "07091.png", "07101.png", "08301.png", "08310.png", "08321.png", "08331.png", "08351.png", "08361.png", "061721.png"],
        ["00171.png", "01211.png", "01221.png", "01231.png", "02241.png", "02251.png", "03140.png", "04271.png", "04281.png", "04291.png", "04301.png", "05141.png", "05151.png", "06201.png", "07131.png", "07141.png", "08450.png", "08461.png", "08471.png", "08481.png", "08491.png", "08501.png", "08511.png", "062121.png"],
        ["44170.png", "44171.png"],
        ["13311.png", "13321.png", "14420.png", "44301.png", "44330.png", "44341.png", "44351.png", "44361.png", "44371.png", "44381.png", "44390.png", "44401.png", "44411.png"],
        ["44210.png", "44220.png", "44221.png", "44230.png", "44240.png", "44241.png", "44250.png", "44251.png", "44260.png", "44261.png", "44270.png", "44271.png", "44280.png"],
        ["44290.png"],
        ["44420.png", "44430.png", "44440.png", "44450.png", "44460.png"]
    ];
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
            // 重置进度条
            $range.val(0).trigger('porpertychange');
            undateBtns(_i);
        })

        //清空当前画面内容
        $(".btn-clean").on('click', function () {
            _dsr.clean();
        })

        // 控制条事件
        let $range = $(".rangeBar")
        $(".rangbox button").on('click', function () {
            let num = $(this).data('num');
            let _val = parseInt($range.val());
            _val += num;
            _val = _val <= 0 ? 0 : _val >= 100 ? 100 : _val;
            $range.val(_val).trigger('porpertychange');
        })

        $range.on('input porpertychange', function () {
            //逻辑部分
            let _val = parseInt($range.val());
            let ratio = (100 + _val) / 100;
            _dsr.range(ratio);
            $(".rangeNum").text('缩放比例：[' + ratio + ']；进度：[' + _val + ']');
        });

        // 移动控制
        let moveDistance = 30;
        $('.directioncbox button').on('click', function () {
            let _direction = $(this).data('dir')

            console.log(_direction)
            _dsr.move(_direction, moveDistance);
        })

        let keyUp = keyboard(38)
        let keyRight = keyboard(39)
        let keyDown = keyboard(40)
        let keyLeft = keyboard(37)
        let keySpace = keyboard(32)

        keyUp.press = () => {
            _dsr.move('up', moveDistance);
        }
        keyRight.press = () => {
            _dsr.move('right', moveDistance);
        }
        keyDown.press = () => {
            _dsr.move('down', moveDistance);
        }
        keyLeft.press = () => {
            _dsr.move('left', moveDistance);
        }
        keySpace.press = () => {
            _dsr.move('center', moveDistance);
        }
    };

    // 键盘事件
    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        //The `downHandler`
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );

        //Return the key object
        return key;
    }

    pageEvent();
})