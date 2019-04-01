/**
 * @name DSR
 * @description D => drag , S => scale , R => rotate
 * @param 
 */
//PIXI API
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

class DSR {
    constructor(opt) {
        let baseSetting = {
            id: '#canvas-box',
            btns: '.btn',
            width: 650,
            height: 490,
            bgColor: 0xffffff
        };

        this._App = null //舞台
        this._Tink = null //tink
        this._Pointer = null //pointer
        this._Container = null;

        this.msgStyle = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 26
        });

        //合并参数
        this.opt = opt;
        this.setting = $.extend(baseSetting, opt);

        //内部变量
        this.resource = opt.resources[0]
        this.bisicResource = __uri('assets/basic.json');
        this.scene = null;
        this.spriteList = [];
        this.curSprite = null;
        this.dragCtr = null;
        this.delCtr = null;
        this.isHitSprite = false;
        this.isHitDrag = false;
        this.isHitDel = false;
        this.baseDistance = null;
        this.cache = [];

        this._cx = opt.width / 2
        this._cy = opt.height / 2

        //say hello
        let type = PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas";
        PIXI.utils.sayHello(type);

        //初始化
        this.init();
    }

    //初始化
    init() {
        let self = this,
            _setting = this.setting;

        //创建画布
        this._App = new Application({
            width: _setting.width,
            height: _setting.height
        });

        //画布添加到容器
        document.getElementById(_setting.id.replace('#', '')).appendChild(this._App.view);

        //设置背景色
        let bgColor = this.opt.bgColor ? this.opt.bgColor.replace('#', '') : 'ffffff';
        this._App.renderer.backgroundColor = '0x' + bgColor;

        //初始化Tink.js
        this._Tink = new Tink(PIXI, this._App.view);

        self.message = new PIXI.Text("Loading...", self.msgStyle);
        self.message.position.set(self._cx, self._cy);
        self.message.anchor.set(.5, .5);
        this._App.stage.addChild(self.message);

        //开始加载
        this.load();

        //初始化回调函数
        _setting.onInit && _setting.onInit();
    }

    load() {
        let self = this,
            _setting = this.setting;

        PIXI.loader
            .add(self.bisicResource)
            .add(self.resource)
            .on('progress', _setting.onLoad)
            .load(setup.bind(this));

        function setup() {
            //定时循环
            this._App.ticker.add(delta => gameLoop(delta));
            this._Container = new Container();
            this._App.stage.addChild(self._Container);

            //初始化舞台
            self.initStage();

            //创建控件并隐藏
            this.initCtr();

            //添加舞台和按钮事件
            this.tinkEvent();
            this.btnEvent();

            //记录缓存
            this.cache.push(self.resource);

            //加载完成事件回调
            _setting.onLoaded && _setting.onLoaded();
        }

        function gameLoop() {
            let curSprite = self.curSprite
            // console.log(deleta)
            self._Tink.update();

            //触摸舞台时，且触碰到精灵时，更新控件坐标
            if (self._Pointer.isDown && self.isHitSprite && !self.isHitDrag && !self.isHitDel) {
                console.log('你碰到我啦！我叫 [' + curSprite._texture.textureCacheIds + ']')
                self.updateCtr(curSprite);
            }

            // //选中拖放
            if (self.isHitDrag && self.baseDistance != null) {
                let curDistance = self.calcDistance([curSprite.x, curSprite.y], [self._Pointer.x, self._Pointer.y]);
                let _scale = curDistance / self.baseDistance;
                curSprite.scale.set(_scale, _scale);
                self.updateCtr(curSprite);
            }
        }
    }

    initStage() {
        let self = this;
        //加载纹理资源
        this.scene = PIXI.loader.resources[self.resource].textures;

        this.message.visible = false;

        //加载背景图
        let ground = new Sprite(self.scene['ground-min.png']);
        ground.anchor.set(.5, .5);
        ground.position.set(self._cx, self._cy);
        self.autoAdaptation(ground);

        this._Container.addChild(ground);
    }

    initCtr() {
        let self = this;
        //创建控件并隐藏
        this.basicCtr = PIXI.loader.resources[self.bisicResource].textures;
        this.dragCtr = new Sprite(self.basicCtr['icon-drag.png']);
        this.delCtr = new Sprite(self.basicCtr['icon-del.png']);

        this.dragCtr.anchor.set(.5, .5);
        this.delCtr.anchor.set(.5, .5);

        this.dragCtr.visible = false;
        this.delCtr.visible = false;

        //添加控件到舞台
        this._App.stage.addChild(this.dragCtr, this.delCtr);
    }

    autoAdaptation(sprite) {
        let self = this,
            ratioApp = self._App.renderer.width / self._App.renderer.height,
            ratioSprite = sprite.width / sprite.height,
            ratio = 1;

        if (ratioApp >= ratioSprite) {
            // 高缩放
            ratio = self._App.renderer.height / sprite.height;
        } else {
            // 宽缩放
            ratio = self._App.renderer.width / sprite.width;
        }
        sprite.scale.set(ratio, ratio);

    }

    change(resource) {
        let self = this,
            _setting = this.setting;
        console.log(resource)
        self.message.visible = true;
        self.resource = resource;

        //加载资源
        if (self.cache.indexOf(resource) < 0) {
            PIXI.loader
                .add(self.resource)
                .load(setup2.bind(this));
        } else {
            setup2();
        }

        function setup2() {
            //重置当前画布
            self.resetStage();

            //更新当前画布内容为新场景
            self.initStage();

            //记录缓存
            self.cache.push(self.resource);
        }

    }

    //清空画面内容
    clean() {
        for (let i = 0; i < this._App.stage.children.length; i++) {
            let child = this._App.stage.children[i];
            console.log(child)
            // if(child)
        }
    }

    //重置当前画布
    resetStage() {
        let self = this;
        //清空当前画布
        // self._App.stage.removeChildren();
        self._Container.removeChildren();
        self._Tink.makeUndraggable(self.spriteList);
        this.spriteList = [];
        this.curSprite = null;
        // this.dragCtr = null;
        // this.delCtr = null;
        this.dragCtr.visible = false;
        this.delCtr.visible = false;
        this.isHitSprite = false;
        this.isHitDrag = false;
        this.isHitDel = false;
        this.baseDistance = null;

        //重置按钮样式
        $(this.setting.btns).removeClass('disabled');
    }

    //舞台事件
    tinkEvent() {
        let self = this,
            dragCtr = self.dragCtr,
            delCtr = self.delCtr

        self._Pointer = this._Tink.makePointer();

        //press事件
        self._Pointer.press = () => {
            console.log("The pointer was pressed");

            //避免拖拽事件把精灵层级提上来，默认先禁止拖拽
            for (let i = 0; i < self.spriteList.length; i++) {
                self.spriteList[i].draggable = false;
            }

            //先检测是否触摸到控件
            if (self._Pointer.hitTestSprite(self.dragCtr) && self.dragCtr.visible == true) {
                //点击了【缩放】控件
                self.isHitDrag = true;
                console.log('你点到缩放控件啦！缩放了 [' + self.curSprite._texture.textureCacheIds + ']')

                let difX = self._Pointer.x - (self.dragCtr.x - self.dragCtr.width / 2);
                let difY = (self.dragCtr.y + self.dragCtr.height / 2) - self._Pointer.y;
                self.baseDistance = self.calcDistance([self.curSprite.x, self.curSprite.y], [self.curSprite.x + (self.curSprite.width / self.curSprite.scale.x / 2) + difX,
                    self.curSprite.y - (self.curSprite.height / self.curSprite.scale.x / 2) - difY
                ])
            } else if (self._Pointer.hitTestSprite(self.delCtr) && self.delCtr.visible == true) {
                //点击了【删除】控件
                self.isHitDel = true;
                console.log('你点到删除控件啦！删除了 [' + self.curSprite._texture.textureCacheIds + ']')
                //删除当前精灵，并隐藏控件
                // t.makeUndraggable(curSprite);
                self.spriteList.splice(self.spriteList.indexOf(self.curSprite), 1);
                self._Container.removeChild(self.curSprite);
                self._Tink.makeUndraggable(self.curSprite);
                self.showCtr(false);
                self.updateBtn();
            } else {
                // console.log(pointer.hitTestSprite(face0));
                self.isHitSprite = false;
                for (let i = self.spriteList.length - 1; i >= 0; i--) {
                    // console.log()
                    if (self._Pointer.hitTestSprite(self.spriteList[i])) {
                        let _cur = self.spriteList[i]
                        _cur.draggable = true;
                        // console.log(_cur._texture.textureCacheIds)
                        self.isHitSprite = true;
                        self.spriteList.splice(i, 1)
                        self.spriteList.push(_cur)
                        self.curSprite = _cur
                        break;
                    }
                }
                if (self.isHitSprite) {
                    console.log('isHitSprite : ' + self.isHitSprite + ', 选中 ' + '[' + self.curSprite._texture
                        .textureCacheIds + ']')
                } else {
                    //没有点中任何东西
                    console.log('未选中任何物件')
                    self.curSprite = null;
                }
                self.showCtr(self.isHitSprite);
            }

        };

        //触碰释放
        self._Pointer.release = () => {
            this.isHitDrag = false;
            this.isHitDel = false;
            // baseDistance = null;
            // for (let i = 0; i < spriteList.length; i++) {
            //     spriteList[i].draggable = false;
            // }
        }
    }

    //外部按钮事件
    btnEvent() {
        let self = this,
            _setting = this.setting;

        //物件按钮事件
        $(_setting.btns).on('click', function () {
            let $this = $(this),
                _name = $this.data('name')

            //限制只能添加一次
            if ($this.hasClass('disabled')) return;
            $this.addClass('disabled');

            //创建和添加物件精灵
            self.add(_name);
        })
    }

    //添加雪精灵
    add(name) {
        let self = this

        //添加内容到画布
        console.log('[' + name + '] 添加到画布')
        //创建精灵
        let _sprite = new Sprite(self.scene[name]);

        _sprite.position.set(self._cx, self._cy);
        _sprite.anchor.set(.5, .5);

        //存储到精灵数组
        self.spriteList.push(_sprite);
        //添加到舞台
        // self._App.stage.addChild(_sprite);
        self._Container.addChild(_sprite);

        console.log(self._Container);
        //给精灵绑定拖放交互
        self._Tink.makeDraggable(_sprite);
        //给精灵添加交互绑定-让精灵可以像button一样有点击事件绑定
        // t.makeInteractive(_sprite);

        //给精灵点击事件
        // _sprite.press = () => {
        //     //Do something when the pointer presses the sprite
        //     // console.log('you press me! And my name is [' + _sprite._texture.textureCacheIds[0] +
        //     //     ']')
        // };

        self.curSprite = _sprite;

        //显示控件
        self.showCtr(true);
        //更新控件坐标
        self.updateCtr(_sprite);
    }

    //展示控件
    showCtr(boolean) {
        this.dragCtr.visible = boolean;
        this.delCtr.visible = boolean;

        //同时更新控件在舞台的层级
        this.updateStage(this.dragCtr);
        this.updateStage(this.delCtr);
    }

    //更新控件坐标
    updateCtr(sprite) {
        let s_width = sprite.width,
            s_height = sprite.height,
            s_x = sprite.x, //精灵中心坐标
            s_y = sprite.y //精灵中心坐标

        this.dragCtr.x = s_x + s_width / 2 + this.dragCtr.width / 2;
        this.dragCtr.y = s_y - s_height / 2 - this.dragCtr.height / 2;
        this.delCtr.x = s_x - s_width / 2 - this.delCtr.width / 2;
        this.delCtr.y = s_y + s_height / 2 + this.delCtr.height / 2;
    }

    //更新物件按钮显示
    updateBtn() {
        let self = this,
            _setting = this.setting,
            children = this._Container.children,
            $btn = $(_setting.btns)

        $btn.removeClass('disabled')
        $btn.each(function () {
            let $this = $(this)
            let _name = $this.data('name')
            for (let i = 0; i < children.length; i++) {
                if (_name == children[i]._texture.textureCacheIds[0]) {
                    $this.addClass('disabled')
                }
            }
        })
    }

    //更新精灵层级
    updateStage(sprite) {
        let children = this._App.stage.children;
        children.splice(children.indexOf(sprite), 1);
        children.push(sprite);
    }

    //计算坐标点之间的距离
    calcDistance(pointA, pointB) {
        let [x1, y1] = pointA;
        let [x2, y2] = pointB;

        return Math.ceil(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)))
    }
}