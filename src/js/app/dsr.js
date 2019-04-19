/**
 * @name DSR
 */
// PIXI API
let __Application = PIXI.Application,
    __Container = PIXI.Container,
    __resources = PIXI.loader.resources,
    __Sprite = PIXI.Sprite;

class DSR {
    constructor(opt) {
        // 第三方库变量
        this._App = null // 舞台
        this._Tink = null // tink
        this._Pointer = null // pointer
        this._Container = null; // 物件组容器

        // this.msgStyle = new PIXI.TextStyle({
        //     fontFamily: "Arial",
        //     fill: "black",
        //     fontSize: 26
        // });

        // 参数设置
        this.setting = opt;

        // 内部变量
        this.resource = opt.resources[0]
        this.bisicResource = __uri('assets/basic.json');
        this.scene = null;
        this.spriteList = [];
        this.curSprite = null;
        this.dragCtr = null;
        this.delCtr = null;
        this.flipCtr = null;
        this.isHitSprite = false;
        this.isHitDrag = false;
        this.isHitDel = false;
        this.isHitFlip = false;
        this.baseDistance = null;
        this.cache = [];
        this.loading = false;
        this.vRatio = 1;
        this._distance = {
            x: 0,
            y: 0
        };

        this.width = opt.width;
        this.height = opt.height;
        this._cx = opt.width / 2;
        this._cy = opt.height / 2;

        // say hello
        let type = PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas";
        PIXI.utils.sayHello(type);

        // 初始化
        this.init();
    }

    set vDistance(obj) {
        this._distance = {
            x: obj.x,
            y: obj.y
        };
    }

    get vDistance() {
        return this._distance;
    }

    // 初始化
    init() {
        let self = this,
            _setting = this.setting;

        // 创建画布
        this._App = new __Application({
            width: _setting.width,
            height: _setting.height,
            antialias: true,
            transparent: this.setting.bgColor ? false : true
        });

        // 画布添加到容器
        document.getElementById(_setting.id.replace('#', '')).appendChild(this._App.view);

        // 设置背景色
        if (this.setting.bgColor) {
            this._App.renderer.backgroundColor = '0x' + this.setting.bgColor.replace('#', '');
        }

        // 初始化Tink.js
        this._Tink = new Tink(PIXI, this._App.view);

        this._Container = new __Container();
        this._Container.pivot.set(self.width / 2, self.height / 2);
        this._Container.position.set(self.width / 2, self.height / 2);
        // this._Container.scale.set(2, 2);
        this._App.stage.addChild(self._Container);

        // 提示信息
        // self.message = new PIXI.Text("Loading...", self.msgStyle);
        // self.message.position.set(self._cx, self._cy);
        // self.message.anchor.set(.5, .5);
        // this._App.stage.addChild(self.message);

        // 开始加载
        this.load();

        // 初始化回调函数
        _setting.onInit && _setting.onInit();
    }

    load() {
        let self = this,
            _setting = this.setting;

        self.loading = true;
        PIXI.loader
            .add(self.bisicResource)
            .add(self.resource)
            .on('progress', _setting.onLoad)
            .load(setup.bind(this));

        function setup() {
            self.loading = false;
            // 定时循环
            this._App.ticker.add(delta => gameLoop(delta));

            // 创建控件并隐藏
            this.initCtr();

            // 初始化舞台
            self.initStage();

            // 添加舞台和按钮事件
            this.tinkEvent();
            this.btnEvent();

            // 记录缓存
            this.cache.push(self.resource);

            // 加载完成事件回调
            _setting.onLoaded && _setting.onLoaded();
        }

        function gameLoop() {
            let curSprite = self.curSprite
            // console.log(deleta)
            self._Tink.update();

            // 触摸舞台时，且触碰到精灵时，更新控件坐标
            if (self._Pointer.isDown && self.isHitSprite && !self.isHitDrag && !self.isHitDel) {
                console.log('你碰到我啦！我叫 [' + curSprite._texture.textureCacheIds + ']')
                self.updateCtr(curSprite);
            }

            // 选中拖放
            if (self.isHitDrag && self.baseDistance != null) {
                let curDistance = self.calcDistance([curSprite.x, curSprite.y], [self._Pointer.x, self._Pointer.y]);
                let _scale = curDistance / self.baseDistance;
                curSprite.scale.set(_scale, _scale);
                self.updateCtr(curSprite);
            }

            // 房间缓动
            self._Container.x = self._Container.x + (self._cx + self.vDistance.x - self._Container.x) / 10;
            self._Container.y = self._Container.y + (self._cy + self.vDistance.y - self._Container.y) / 10;

            // 缩放缓动
            let curScale = self._Container.scale.x,
                diffRatio = curScale + (self.vRatio - curScale) / 10
            self._Container.scale.set(diffRatio, diffRatio);
        }
    }

    initStage() {
        let self = this;
        // 加载纹理资源
        this.scene = __resources[self.resource].textures;

        self.loadingBar.visible = false;

        // 加载背景图
        let ground = new __Sprite(self.scene['ground-min.png']);
        ground.anchor.set(.5, .5);
        ground.position.set(self._cx, self._cy);
        self.autoAdaptation(ground);

        this._Container.addChild(ground);
    }

    initCtr() {
        let self = this;
        // 创建控件并隐藏
        this.basicCtr = __resources[self.bisicResource].textures;
        this.dragCtr = new __Sprite(self.basicCtr['icon-drag.png']);
        this.delCtr = new __Sprite(self.basicCtr['icon-del.png']);
        this.flipCtr = new __Sprite(self.basicCtr['icon-flip.png']);
        this.loadingBar = new __Sprite(self.basicCtr['loading.png']);

        this.dragCtr.anchor.set(.5, .5);
        this.delCtr.anchor.set(.5, .5);
        this.flipCtr.anchor.set(.5, .5);
        // this.loadingBar.anchor.set(.5, .5);

        this.dragCtr.visible = false;
        this.delCtr.visible = false;
        this.flipCtr.visible = false;
        this.loadingBar.visible = true;

        this.loadingBar.position.set((self.width - self.loadingBar.width - 1) / 2, (self.height - self.loadingBar.height - 1) / 2);

        // 添加控件到舞台
        this._App.stage.addChild(this.dragCtr, this.delCtr, this.flipCtr, this.loadingBar);
    }

    autoAdaptation(sprite) {
        let self = this,
            ratioApp = self._App.renderer.width / self._App.renderer.height,
            ratioSprite = sprite.width / sprite.height,
            ratio = 1;

        if (ratioApp >= ratioSprite) {
            // 高缩放
            // ratio = self._App.renderer.height / sprite.height;
            ratio = self._App.renderer.width / sprite.width;
        } else {
            // 宽缩放
            ratio = self._App.renderer.height / sprite.height;
            // ratio = self._App.renderer.width / sprite.width;
        }
        sprite.scale.set(ratio, ratio);
    }

    change(resource) {
        let self = this,
            _setting = this.setting;
        // console.log(resource)
        // self.message.visible = true;
        self.resource = resource;
        self.loading = true;
        self.loadingBar.visible = true;

        // 加载资源
        if (self.cache.indexOf(resource) < 0) {
            PIXI.loader
                .add(self.resource)
                .load(setup2.bind(this));
        } else {
            setup2();
        }

        function setup2() {
            self.loading = false;
            self.loadingBar.visible = false;
            // 重置当前画布
            self.resetStage();

            // 更新当前画布内容为新场景
            self.initStage();

            // 记录缓存
            self.cache.push(self.resource);

            _setting.onChange && _setting.onChange();
        }

    }

    // 清空画面内容
    clean() {
        this.resetStage(1);
    }

    // 返回不包含地板的精灵数量
    getChildLen() {
        return this._Container.children.length - 1;
    }

    // 重置当前画布 type: 0 => 全部清除  1 => 清除除了ground以外的所有内容
    resetStage(type = 0) {
        let self = this,
            children = this._Container.children;

        // 清空当前画布  全部清除 or 清除除了ground以外的所有内容
        if (type == 0) {
            this._Container.removeChildren(0);
        } else if (type == 1 && children.length > 1) {
            this._Container.removeChildren(1);
        }

        // 状态重置
        self._Tink.makeUndraggable(self.spriteList);
        this.spriteList = [];
        this.curSprite = null;
        this.dragCtr.visible = false;
        this.delCtr.visible = false;
        this.flipCtr.visible = false;
        this.isHitSprite = false;
        this.isHitDrag = false;
        this.isHitDel = false;
        this.isHitFlip = false;
        this.baseDistance = null;

        // 重置缩放比例，偏移量
        this.vRatio = 1;
        this.vDistance = {
            x: 0,
            y: 0
        };

        // 重置按钮样式
        $(this.setting.btns).removeClass('disabled');
    }

    // 舞台事件
    tinkEvent() {
        let self = this,
            _setting = self.setting;

        self._Pointer = this._Tink.makePointer();
        this._Tink.vScale = 1;

        // press事件
        self._Pointer.press = () => {
            console.log("The pointer was pressed");

            // 避免拖拽事件把精灵层级提上来，默认先禁止拖拽
            for (let i = 0; i < self.spriteList.length; i++) {
                self.spriteList[i].draggable = false;
            }

            // 先检测是否触摸到控件
            if (self._Pointer.hitTestSprite(self.dragCtr) && self.dragCtr.visible == true) {
                // 点击了【缩放】控件
                self.isHitDrag = true;
                console.log('你点到缩放控件啦！缩放了 [' + self.curSprite._texture.textureCacheIds + ']');
                let _scale = self.curSprite.scale.x == 0 ? 1 : self.curSprite.scale.x;
                self.baseDistance = self.calcDistance([self.curSprite.x, self.curSprite.y], [self._Pointer.x, self._Pointer.y]) / _scale;
            } else if (self._Pointer.hitTestSprite(self.delCtr) && self.delCtr.visible == true) {
                // 点击了【删除】控件
                self.isHitDel = true;
                console.log('你点到删除控件啦！删除了 [' + self.curSprite._texture.textureCacheIds + ']');
                // 删除当前精灵，并隐藏控件
                // t.makeUndraggable(curSprite);
                self.spriteList.splice(self.spriteList.indexOf(self.curSprite), 1);
                self._Container.removeChild(self.curSprite);
                self._Tink.makeUndraggable(self.curSprite);
                self.showCtr(false);
                if (_setting.limitOnce && _setting.limitOnce) {
                    self.updateBtn();
                }
            } else if (self._Pointer.hitTestSprite(self.flipCtr) && self.flipCtr.visible == true) {
                // 点击了【翻转】控件
                self.isHitFlip = true;
                console.log('你点到翻转控件啦！翻转了 [' + self.curSprite._texture.textureCacheIds + ']');
                let _deg = self.curSprite.skew.y == Math.PI ? 0 : Math.PI;
                self.curSprite.skew.set(0, _deg);
            } else {
                // console.log(pointer.hitTestSprite(face0));
                self.isHitSprite = false;
                for (let i = self.spriteList.length - 1; i >= 0; i--) {
                    // console.log()
                    if (self._Pointer.hitTestSprite(self.spriteList[i])) {
                        let _cur = self.spriteList[i];
                        _cur.draggable = true;
                        self.isHitSprite = true;
                        self.spriteList.splice(i, 1);
                        self.spriteList.push(_cur);
                        self.curSprite = _cur;
                        break;
                    }
                }
                if (self.isHitSprite) {
                    console.log('isHitSprite : ' + self.isHitSprite + ', 选中 ' + '[' + self.curSprite._texture
                        .textureCacheIds + ']');
                } else {
                    //没有点中任何东西
                    console.log('未选中任何物件');
                    self.curSprite = null;
                }
                self.showCtr(self.isHitSprite);
            }

        };

        //触碰释放
        self._Pointer.release = () => {
            this.isHitDrag = false;
            this.isHitDel = false;
            this.isHitFlip = false;
        }

    }

    // 外部按钮事件
    btnEvent() {
        let self = this,
            _setting = this.setting;

        // 物件按钮事件
        $(document).delegate(_setting.btns, 'click', function () {
            if (self.loading) return;
            let $this = $(this),
                _name = $this.data('name')

            // 限制只能添加一次
            if (_setting.limitOnce && _setting.limitOnce) {
                if ($this.hasClass('disabled')) return;
                $this.addClass('disabled');
            }

            // 创建和添加物件精灵
            self.add(_name);
        })
    }

    // 添加雪精灵
    add(name) {
        let self = this

        // 添加内容到画布
        console.log('[' + name + '] 添加到画布')
        // 创建精灵
        let _sprite = new __Sprite(self.scene[name]),
            _scale = self.setting.basicScale ? self.setting.basicScale : 1,
            _direction = self.setting.basicDirection && self.setting.basicDirection == 'flip' ? Math.PI : 0;

        _sprite.position.set(self._cx, self._cy);
        _sprite.anchor.set(.5, .5);
        _sprite.scale.set(_scale, _scale);
        _sprite.skew.set(0, _direction);

        // 存储到精灵数组
        self.spriteList.push(_sprite);
        // 添加到舞台
        self._Container.addChild(_sprite);

        // 给精灵绑定拖放交互
        self._Tink.makeDraggable(_sprite);

        // 给精灵点击事件
        // _sprite.press = () => {
        //     //Do something when the pointer presses the sprite
        //     // console.log('you press me! And my name is [' + _sprite._texture.textureCacheIds[0] +
        //     //     ']')
        // };

        self.curSprite = _sprite;

        // 显示控件
        self.showCtr(true);
        // 更新控件坐标
        self.updateCtr(_sprite);
    }

    set vRatio(value) {
        this._vRatio = value;
    }

    get vRatio() {
        return this._vRatio;
    }

    // 整体缩放
    range(ratio) {
        let self = this

        // self._Container.scale.set(ratio, ratio);
        self.vRatio = ratio;
        this._Tink.vScale = ratio;
        this.showCtr(false);
    }

    // 整体移动
    move(direction, distance) {
        let self = this,
            _dis = self.vDistance;

        switch (direction) {
            case 'up':
                // self._Container.y -= distance;
                _dis.y -= distance;
                break;
            case 'down':
                // self._Container.y += distance;
                _dis.y += distance;
                break;
            case 'left':
                // self._Container.x -= distance;
                _dis.x -= distance;
                break;
            case 'right':
                // self._Container.x += distance;
                _dis.x += distance;
                break;
            case 'center':
                // self._Container.position.set(self.width / 2, self.height / 2)
                _dis = {
                    x: 0,
                    y: 0
                };
                break;
        }
        this.showCtr(false);
        // this.updateCtr();
        self.vDistance = _dis;
        self._Tink.vDistance = _dis;
    }

    // 展示控件
    showCtr(boolean) {
        this.dragCtr.visible = boolean;
        this.delCtr.visible = boolean;
        this.flipCtr.visible = boolean;

        // 同时更新控件在舞台的层级
        this.updateStage(this.dragCtr);
        this.updateStage(this.delCtr);
        this.updateStage(this.flipCtr);
    }

    // 更新控件坐标
    updateCtr(sprite) {
        let _ratio = this.vRatio,
            s_width = sprite.width * _ratio,
            s_height = sprite.height * _ratio,
            s_x = sprite.x * _ratio, // 精灵中心坐标
            s_y = sprite.y * _ratio, // 精灵中心坐标
            v_diff = { // 缩放后的原点坐标偏移 + container的偏移量
                x: (this.width * (_ratio - 1) / 2) - this.vDistance.x,
                y: (this.height * (_ratio - 1) / 2) - this.vDistance.y,
            };

        // 控件坐标 = 当前精灵中心坐标 +(-) 精灵宽高 * 缩放倍数 +(-) 控件自身坐标偏移 - 缩放后的原点坐标偏移 + container的偏移量
        this.dragCtr.x = s_x + s_width / 2 + this.dragCtr.width / 2 - v_diff.x;
        this.dragCtr.y = s_y - s_height / 2 - this.dragCtr.height / 2 - v_diff.y;
        this.delCtr.x = s_x - s_width / 2 - this.delCtr.width / 2 - v_diff.x;
        this.delCtr.y = s_y + s_height / 2 + this.delCtr.height / 2 - v_diff.y;
        this.flipCtr.x = s_x - s_width / 2 - this.flipCtr.width / 2 - v_diff.x;
        this.flipCtr.y = s_y - s_height / 2 - this.flipCtr.height / 2 - v_diff.y;
    }

    // 更新物件按钮显示
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

    // 更新精灵层级
    updateStage(sprite) {
        let children = this._App.stage.children;
        children.splice(children.indexOf(sprite), 1);
        children.push(sprite);
    }

    // 计算坐标点之间的距离
    calcDistance(pointA, pointB) {
        let [x1, y1] = pointA;
        let [x2, y2] = pointB;

        return Math.ceil(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)))
    }
}