/**
 * @file 主文件
 * @author afcfzf<9301462@qq.com>
*/
var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.$textPos = 0;
        _this.$bg = null; // 背景
        _this.$playground = null; // 方块区域
        _this.$pgr = null; // 方块背景（绘制）
        _this.$vertCount = 0; // 垂直个数
        _this.$per = 0; // 单个块的宽高
        _this.$horzCount = 10; // 水平单个块个数
        _this.$baseY = 0; // 基准，顶点Y轴，用于求左右移动的距离
        _this.$tShapes = null; // 所有图形的定义
        _this.$currTshape = 'z'; // 当前控制的图形
        _this.$currTshapeData = [];
        _this.$currTshapeCount = 0; // 当前图形的所有分类
        _this.$currTshapeIdx = 0; // 当前图形的下标
        _this.$ctrlSpr = null; // 被控制的Sripte
        _this.$ctrlTiles = []; // 被控制的shape
        _this.$keyMap = {
            currLorR: null // 记录已经按下的左或右，防止冲突
        };
        /**
         * 处理按键事件
        */
        _this.i = 0;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.init, _this);
        return _this;
    }
    Main.prototype.init = function () {
        var _this = this;
        // 屏幕显示模式
        this.stage.scaleMode = egret.StageScaleMode.NO_SCALE;
        this.stage.addEventListener(egret.Event.RESIZE, this.paint, this);
        // 这里加egret.Event.RESIZE 无效
        // window.addEventListener('resize', this.paint.bind(this));
        window.addEventListener('keydown', function (e) { return _this.keyDownHandler(e.keyCode); });
        window.addEventListener('keyup', function (e) { return _this.keyUpHandler(e.keyCode); });
        // 必须等load完分组，然后才load资源
        var onResourceLoadComplete = function () {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, onResourceLoadComplete, _this);
            console.log('载入ui');
            _this.initUi();
        };
        var preload = function () {
            RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, _this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, onResourceLoadComplete, _this);
            RES.loadGroup('preload');
        };
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, this);
        RES.loadConfig('resource/default.res.json', 'resource/');
        // 背景资源完毕
    };
    Main.prototype.paint = function () {
        // $bg 是整个背景，pgr是playground.$graphics
        var wdt = this.$stage.$stageWidth;
        var hgt = this.$stage.$stageHeight;
        // 屏幕变化，适配背景
        Object.assign(this.$bg, {
            width: wdt,
            height: hgt
        });
        // 计算方块区域
        var pgrWdt = wdt - 100;
        var pgrHgt = hgt - 120;
        var horzCount = this.$horzCount;
        var per = this.$per = ~~(pgrWdt / horzCount);
        var vertCount = ~~(pgrHgt / per);
        pgrWdt = per * horzCount;
        pgrHgt = vertCount * per;
        console.log('宽和高： ', pgrWdt, pgrHgt);
        Object.assign(this.$playground, {
            x: 10,
            y: 10,
            width: wdt,
            height: hgt
        });
        this.$pgr.clear();
        this.$pgr.beginFill(0x0, .3);
        this.$pgr.lineStyle(3, 0xffffff, .8);
        this.$pgr.drawRoundRect(-2, -2, pgrWdt + 2, pgrHgt + 2, 4);
        this.$pgr.lineStyle(1, 0xffffff, .2);
        for (var i = 1; i < horzCount; i++) {
            this.$pgr.moveTo(per * i - 1, 0);
            this.$pgr.lineTo(per * i - 1, pgrHgt);
        }
        for (var i = 1; i < vertCount; i++) {
            this.$pgr.moveTo(0, per * i - 1);
            this.$pgr.lineTo(pgrWdt, per * i - 1);
        }
        this.$pgr.endFill();
        var tShapes = this.$tShapes = RES.getRes('preDefine_json');
        var tShape = tShapes[this.$currTshape]; // 此处应然是random
        this.$currTshapeCount = tShape.shape.length;
        this.drawElement(tShape, 0); // 此处idx 也应该是random
    };
    Main.prototype.drawElement = function (shp, idx) {
        var _this = this;
        var per = this.$per;
        var _a = shp.color, bg = _a.bg, shw = _a.shw, cre = _a.cre;
        this.$currTshapeData = shp.shape[idx];
        // 踢墙
        this.autoKick(this.$currTshapeData);
        // 画tile
        this.$currTshapeData.forEach(function (e, i) {
            var tile = _this.$ctrlTiles[i];
            var g = tile.$graphics;
            var baseY = _this.$baseY;
            tile.x = e[0] * per;
            tile.y = e[1] * per;
            g.clear();
            g.beginFill(bg); // 背景色
            g.drawRect(0, 0, per, per);
            g.beginFill(shw); // 阴影颜色
            var mid = ~~(per * .5); // 找中点
            g.drawCircle(mid + 2, mid + 2, per * .3); // 画圆心阴影
            g.beginFill(cre); // 圆心颜色
            g.drawCircle(mid, mid, per * .3); // 画圆心
            g.endFill();
        });
    };
    Main.prototype.initUi = function () {
        // 先初始化背景
        var bg = this.$bg = new egret.Bitmap();
        var texture = RES.getRes('bg_jpg');
        var wdt = this.$stage.$stageWidth;
        var hgt = this.$stage.$stageHeight;
        bg.width = wdt;
        bg.height = hgt;
        bg.texture = texture;
        bg.fillMode = egret.BitmapFillMode.CLIP; //默认情况是拉伸,现改为原图
        this.addChild(bg);
        // 始化方块区域
        var $playground = this.$playground = new egret.Sprite();
        var $pgr = this.$pgr = this.$playground.$graphics;
        this.addChild($playground);
        // 初始化控制块 
        var spr = this.$ctrlSpr = new egret.Sprite();
        this.$playground.addChild(spr);
        // 初始化控制的tile
        for (var i = 0; i < 4; i++) {
            var tile = new egret.Shape();
            this.$ctrlTiles.push(tile);
            this.$ctrlSpr.addChild(tile);
        }
        // 绘制具体流程，响应屏幕适配
        this.paint();
    };
    /**
     * @param {boolean=} left 是否为左边界
     * @return {boolean} 是否为边界
    */
    Main.prototype.isBorder = function (left) {
        if (left === undefined)
            throw new Error('必须指定是否检测左边界！');
        var tType = this.$currTshape;
        var idx = this.$currTshapeIdx;
        var baseY = this.$baseY;
        var tile0X = this.$currTshapeData[0][0]; // 这是第1个片的x轴坐标
        var tile1X = this.$currTshapeData[1][0]; // 这是第2个片的x轴坐标
        var range = [tile0X, tile1X]; // range是宽度范围,要深拷贝
        this.$currTshapeData.forEach(function (e) {
            var x = e[0];
            x < range[0] && (range[0] = x);
            x > range[1] && (range[1] = x);
        });
        if (left && range[0] + baseY <= 0)
            return true;
        if (!left && range[1] + baseY + 1 >= this.$horzCount)
            return true;
        return false;
    };
    /**
     * 向左移一位
     * 1. sprite向左移一位
     * 2. this.$baseY向左移一位，后面记得update就可以了
     * @inner
    */
    Main.prototype.moveLeft = function () {
        if (this.isBorder(true))
            return null;
        this.$baseY--;
        this.$ctrlSpr.x -= this.$per;
        console.log('向左移动了', this.$baseY);
    };
    /**
     * 向右移一位
    */
    Main.prototype.moveRight = function () {
        if (this.isBorder(false))
            return null;
        this.$baseY++;
        this.$ctrlSpr.x += this.$per;
        console.log('向右移动了', this.$baseY);
    };
    /**
     * 踢墙
     * @param {Array} tShapeData 当前图形数据
     * @inner
    */
    Main.prototype.autoKick = function (tShapeData) {
        var range = [tShapeData[0][0], tShapeData[1][0]]; // 第一个片和第二个片的坐标
        tShapeData.forEach(function (e) {
            var x = e[0];
            x < range[0] && (range[0] = x);
            x > range[1] && (range[1] = x);
        });
        var tileCount = range[1] - range[0] + 1; // 加一是因为俩x坐标的差最小是1，那么至少占1格，比如长条
        this.$ctrlSpr.width = this.$per * tileCount;
        this.$ctrlSpr.height = this.$per * tileCount;
        this.$ctrlSpr.x < 0 && this.moveRight(); // 如果sprite < 0 向右移一位
        var maxWdt = this.$per * this.$horzCount;
        console.log('autoKick:', (this.$baseY + tileCount) * this.$per, maxWdt);
        while ((this.$baseY + tileCount) * this.$per > maxWdt) {
            this.moveLeft();
        }
    };
    Main.prototype.hasProc = function (hash) {
        var bool = false;
        this.$keyMap[hash] && (bool = true);
        return bool;
    };
    /**
     * 开始长按点击
    */
    Main.prototype.startRepeatProc = function (hash, proc) {
        // 防止同时按下左右, 而且以最后按下的为主
        var ck = this.$keyMap['currLorR'];
        (hash === 37 || hash === 39) && ck !== hash && this.$keyMap[ck] && this.stopRepeatProc(ck);
        if (this.$keyMap[hash])
            return null;
        this.$keyMap[hash] = proc;
        egret.startTick(this.$keyMap[hash], this);
        (hash === 37 || hash === 39) && (this.$keyMap['currLorR'] = hash);
    };
    /**
     * 停止长按点击
    */
    Main.prototype.stopRepeatProc = function (hash) {
        if (!this.hasProc(hash))
            return null; // 防止提前解决了左右冲突导致出错
        egret.stopTick(this.$keyMap[hash], this);
        this.$keyMap[hash] = null;
    };
    /**
     * 处理 keydown
     * @param keyCode {number} 按键码
    */
    Main.prototype.keyDownHandler = function (keyCode) {
        var _this = this;
        var i = 0;
        var createText = function () {
            var tf = new egret.TextField();
            tf.x = 10;
            tf.y = _this.$textPos;
            _this.$textPos += 5;
            tf.text = '按下' + i++;
            tf.size = 12;
            _this.$playground.addChild(tf);
        };
        switch (keyCode) {
            case 38:// up
                var idx = ++this.$currTshapeIdx % this.$currTshapeCount;
                this.drawElement(this.$tShapes[this.$currTshape], idx);
                break;
            case 32:// space
                var s = Object.keys(this.$tShapes)[this.i++];
                this.$currTshape = s;
                this.$currTshapeIdx = 0;
                this.$currTshapeCount = this.$tShapes[this.$currTshape].shape.length;
                break;
            case 37:// left
                this.startRepeatProc(keyCode, this.moveLeft);
                break;
            case 39:// right
                this.startRepeatProc(keyCode, this.moveRight);
                break;
            case 40:// down
                this.startRepeatProc(keyCode, createText);
            default:
                break;
        }
    };
    // keyup
    Main.prototype.keyUpHandler = function (keyCode) {
        this.stopRepeatProc(40);
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map