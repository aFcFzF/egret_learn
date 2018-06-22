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
        _this.$gameTiles = []; // playground 里面的所有方块
        _this.$vertCount = 0; // 垂直个数
        _this.$per = 0; // 单个块的宽高
        _this.$horzCount = 10; // 水平单个块个数
        _this.$baseX = 0; // x轴基准, 左右距离
        _this.$baseY = 0; // y轴基准，上下距离
        _this.$tShapes = null; // 所有图形的定义
        _this.$currTshape = 'z'; // 当前控制的图形
        _this.$currTshapeData = []; // 这是坐标数组
        _this.$currRealPos = [];
        _this.$currTshapeCount = 0; // 当前图形的所有分类
        _this.$currTshapeIdx = 0; // 当前图形的下标
        _this.$ctrlSpr = null; // 被控制的Sripte
        _this.$ctrlTiles = []; // 被控制的shape
        // private $ctrlTilesPos: Array<Array<number>> = []; // 暂时没用到
        _this.$currLorR = null; // 记录已经按下的左或右，防止冲突
        _this.$ctrlBtns = {
            '38': {
                sprName: 'rotate',
                spr: null,
                bg: 'rotate_png',
                start: false,
                proc: null,
                tap: null
            },
            '40': {
                sprName: 'down',
                spr: null,
                bg: 'down_png',
                start: false,
                proc: null,
                tap: null
            },
            // 'undefin': {
            //     sprName: 'hardDown',
            //     spr: null,
            //     bg: 'hard_down_png',
            //     start: false,
            //     proc: null,
            //     tap: null
            // },
            '37': {
                sprName: 'left',
                spr: null,
                bg: 'left_png',
                start: false,
                proc: null,
                tap: null
            },
            '39': {
                sprName: 'right',
                spr: null,
                bg: 'right_png',
                start: false,
                proc: null,
                tap: null
            }
        };
        _this.$nextList = null;
        /**
         * 处理按键事件
        */
        _this.i = 0;
        _this.interval = 0;
        /**
         * 开始长按点击
        */
        _this.tms = 0;
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
            // 初始化ui
            _this.initUi();
            // 初始化逻辑
            _this.initLogic();
        };
        var preload = function () {
            RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, _this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, onResourceLoadComplete, _this);
            RES.loadGroup('preload');
        };
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, this);
        RES.loadConfig('resource/default.res.json', 'resource/');
    };
    Main.prototype.paint = function () {
        var _this = this;
        // $bg 是整个背景，pgr是playground.$graphics
        var wdt = this.$stage.$stageWidth;
        var hgt = this.$stage.$stageHeight;
        // 屏幕变化，适配背景
        Object.assign(this.$bg, {
            width: wdt,
            height: hgt
        });
        // 计算游戏区域
        var pgrWdt = wdt - 100;
        var pgrHgt = hgt - 120;
        var horzCount = this.$horzCount;
        var per = this.$per = ~~(pgrWdt / horzCount);
        var vertCount = this.$vertCount = ~~(pgrHgt / per);
        pgrWdt = per * horzCount;
        pgrHgt = vertCount * per;
        console.log('宽和高： ', pgrWdt, pgrHgt);
        Object.assign(this.$playground, {
            x: 10,
            y: 10,
            width: pgrWdt,
            height: pgrHgt
        });
        this.$pgr.clear();
        // 绘制背景
        for (var d = 0; d < vertCount; d++) {
            for (var p = 0; p < horzCount; p++) {
                this.$pgr.lineStyle(0);
                (p + d) % 2 === 0 ? this.$pgr.beginFill(0x3D383E, 1) : this.$pgr.beginFill(0x4A4358, 1);
                this.$pgr.drawRoundRect(p * per, d * per, per, per, 3);
                this.$pgr.endFill();
                if (d === vertCount - 1) {
                    this.$pgr.lineStyle(2, 0x000000, .2, false, '', '', '', 0, [5]);
                    this.$pgr.moveTo(per * (p + 1), 0);
                    this.$pgr.lineTo(per * (p + 1), pgrHgt);
                }
            }
            this.$pgr.lineStyle(2, 0x000000, .2, false, '', '', '', 0, [5]);
            this.$pgr.moveTo(0, per * (d + 1));
            this.$pgr.lineTo(pgrWdt, per * (d + 1));
        }
        this.$pgr.beginFill(0x0, .3);
        this.$pgr.lineStyle(3, 0xffffff, .8);
        this.$pgr.drawRoundRect(-2, -2, pgrWdt + 3, pgrHgt + 3, 4);
        this.$pgr.lineStyle(1, 0xffffff, .2);
        this.$pgr.endFill();
        // 适配控制按钮 - 按钮组
        var ctrlGroup = this.getChildByName('btnGroup');
        ctrlGroup.width = wdt - 20;
        var span = ~~((ctrlGroup.width - 4 * 80) / 5);
        ctrlGroup.height = 2 * 80 + span;
        ctrlGroup.x = 10;
        ctrlGroup.y = ~~(pgrHgt + 10 + (hgt - 10 - pgrHgt) / 2) - ~~((ctrlGroup.height - span) * 3 / 4) - 10;
        var btnCount = 4;
        ['37', '39', '40'].forEach(function (e, idx) {
            console.log('距离', (span + 80) * idx);
            _this.$ctrlBtns[e].spr.x = (span + 80) * idx;
            _this.$ctrlBtns[e].spr.y = span + 80;
        });
        this.$ctrlBtns['38'].spr.x = ctrlGroup.width - 80;
        this.$ctrlBtns['38'].spr.y = 0;
    };
    /**
     * 绘制一个teromino
     * @param {string} char 是一个方块的元素名
     * @param {number} num 这个是要绘制的具体旋转形态
    */
    Main.prototype.drawElement = function (char, idx) {
        var _this = this;
        var shp = this.$tShapes[char];
        var per = this.$per;
        var _a = shp.color, bg = _a.bg, shw = _a.shw, cre = _a.cre;
        this.$currTshape = char;
        this.$currTshapeData = shp.shape[idx];
        this.$currTshapeCount = shp.shape.length;
        this.$currTshapeIdx = idx;
        // 踢墙
        this.autoKick(this.$currTshapeData);
        // 画tile
        this.$currTshapeData.forEach(function (e, i) {
            var tile = _this.$ctrlTiles[i];
            var g = tile.$graphics;
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
        var _this = this;
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
        // 初始化按钮
        var btnGroup = new egret.Sprite();
        btnGroup.name = 'btnGroup';
        Object.keys(this.$ctrlBtns).forEach(function (e) {
            var btnItem = _this.$ctrlBtns[e];
            btnItem.spr = new egret.Sprite();
            btnItem.spr.name = btnItem.sprName;
            btnItem.bg = new egret.Bitmap(RES.getRes(_this.$ctrlBtns[e].bg));
            btnItem.bg.fillMode = egret.BitmapFillMode.SCALE;
            btnItem.spr.width = btnItem.bg.width = 80;
            btnItem.spr.height = btnItem.bg.height = 80;
            btnItem.spr.touchEnabled = true;
            btnItem.spr.addEventListener(egret.TouchEvent.TOUCH_BEGIN, _this.keyDownHandler.bind(_this, +e), _this);
            btnItem.spr.addEventListener(egret.TouchEvent.TOUCH_END, _this.keyUpHandler.bind(_this, +e), _this);
            btnItem.spr.addChild(btnItem.bg);
            btnGroup.addChild(btnItem.spr);
        });
        this.addChild(btnGroup);
        // 绘制具体流程，响应屏幕适配
        this.paint();
    };
    // 初始化游戏
    Main.prototype.initLogic = function () {
        var _this = this;
        var hCount = this.$horzCount;
        var vCount = this.$vertCount;
        var gmTilesSprite = new egret.Sprite();
        gmTilesSprite.name = 'gmTiles';
        var gmTiles = this.$gameTiles = Array.from({ length: vCount }, function (row, rowIdx) { return Array.from({ length: hCount }, function (item, itemIdx) {
            var s = new egret.Shape();
            s.x = _this.$per * itemIdx;
            s.y = _this.$per * rowIdx;
            s.width = s.height = _this.$per;
            gmTilesSprite.addChild(s);
            return null;
        }); });
        this.$playground.addChild(gmTilesSprite);
        // 随机生成某个块
        var tShapes = this.$tShapes = RES.getRes('preDefine_json');
        var tetrominoNames = Object.keys(tShapes);
        //const tShape = tShapes[this.$currTshape]; // 此处应然是random
        // this.$currTshapeCount = tShape.shape.length;
        var nList = this.$nextList = {
            _list: [],
            dequeue: function () {
                this.enqueue();
                return this._list.shift();
            },
            enqueue: function () {
                var randomChar = tetrominoNames[~~(Math.random() * tetrominoNames.length)];
                var len = tShapes[randomChar].shape.length;
                var randomIdx = ~~(Math.random() * len);
                this._list.push([randomChar, randomIdx]);
            },
            size: function () {
                return this._list.length;
            }
        };
        // 生成随方块队列-10个
        Array.from({ length: 10 }, function (e) { return nList.enqueue(); });
        var item = nList.dequeue();
        console.log('初始化方块', item);
        this.drawElement(item[0], item[1]);
    };
    /**
     * @param {boolean=} left 是否为左边界  这里是否合成一个checkPos更好呢？一个对象 {left, right, bottom}
     * @return {boolean} 是否为边界
    */
    Main.prototype.isBorder = function (left) {
        if (left === undefined)
            throw new Error('必须指定是否检测左边界！');
        var tType = this.$currTshape;
        var idx = this.$currTshapeIdx;
        var baseX = this.$baseX;
        var tile0X = this.$currTshapeData[0][0]; // 这是第1个片的x轴坐标
        var tile1X = this.$currTshapeData[1][0]; // 这是第2个片的x轴坐标
        var range = [tile0X, tile1X]; // range是宽度范围,要深拷贝
        this.$currTshapeData.forEach(function (e) {
            var x = e[0];
            x < range[0] && (range[0] = x);
            x > range[1] && (range[1] = x);
        });
        if (left && range[0] + baseX <= 0)
            return true;
        if (!left && range[1] + baseX + 1 >= this.$horzCount)
            return true;
        return false;
    };
    /**
     * 旋转
    */
    Main.prototype.rotate = function () {
        if (this.checkPos())
            return;
        var idx = ++this.$currTshapeIdx % this.$currTshapeCount;
        this.drawElement(this.$currTshape, idx);
    };
    /**
     * 向左移一位
     * 1. sprite向左移一位
     * 2. this.$baseX向左移一位，后面记得checkPos就可以了
     * @inner
    */
    Main.prototype.moveLeft = function () {
        if (this.isBorder(true))
            return null;
        this.$baseX--;
        this.$ctrlSpr.x -= this.$per;
        console.log('向左移动了', this.$baseX);
        this.checkPos();
    };
    /**
     * 向右移一位
    */
    Main.prototype.moveRight = function () {
        if (this.isBorder(false))
            return null;
        this.$baseX++;
        this.$ctrlSpr.x += this.$per;
        console.log('向右移动了', this.$baseX);
        this.checkPos();
    };
    /**
     * 向下移一位
    */
    Main.prototype.down = function () {
        var shouldUpdate = this.checkPos();
        shouldUpdate ? console.info('可以update了') : (this.$baseY++, this.$ctrlSpr.y += this.$per);
    };
    /**
     * 检查tetromino位置,判断是否update - 条件1: 触底， 条件2: 下面有块
     * @inner
    */
    Main.prototype.checkPos = function () {
        var _this = this;
        var _a = this, $currTshapeData = _a.$currTshapeData, $baseX = _a.$baseX, $baseY = _a.$baseY, $vertCount = _a.$vertCount, $gameTiles = _a.$gameTiles;
        var tetrominoVertRange = [$currTshapeData[0][1], $currTshapeData[1][1]];
        var realPos = this.$currRealPos = $currTshapeData.map(function (e) {
            e[1] < tetrominoVertRange[0] && (tetrominoVertRange[0] = e[1]); // 计算高度
            e[1] > tetrominoVertRange[1] && (tetrominoVertRange[1] = e[1]);
            return [e[0] + $baseX, e[1] + $baseY]; // 计算实际位置
        });
        var tetrominoHgt = tetrominoVertRange[1] - tetrominoVertRange[0] + 1;
        // 算底
        var map = {};
        var bottomTiles = [];
        realPos.forEach(function (e) {
            var x = e[0];
            var y = e[1];
            map[x] ? map[x][1] < y && (map[x][1] = y) : map[x] = e.slice();
        });
        Object.keys(map).forEach(function (e) { return bottomTiles.push(map[e].slice()); });
        // console.log('算出来的底部是: ', bottomTiles, '实时的块位置： ', realPos);
        // 计算是否块下有障碍物了
        var shouldUpdate = false;
        bottomTiles.forEach(function (e) {
            !shouldUpdate && $baseY + tetrominoHgt >= _this.$vertCount && (shouldUpdate = true); //是否触底
            !shouldUpdate && $gameTiles[e[1] + 1][e[0]] && (shouldUpdate = true); // 是否某一个块的下面有东西
        });
        shouldUpdate && this.update();
        return shouldUpdate;
    };
    /**
     * 更新gameTiles
    */
    Main.prototype.update = function () {
        var _this = this;
        var _a = this, $currRealPos = _a.$currRealPos, $gameTiles = _a.$gameTiles;
        $currRealPos.forEach(function (e) {
            $gameTiles[e[1]][e[0]] = 'te-' + _this.$currTshape;
        });
        // 初始化控制块坐标
        this.$baseX = ~~(this.$horzCount / 2);
        this.$baseY = 0;
        this.$ctrlSpr.y = 0;
        this.$ctrlSpr.x = ~~(this.$horzCount / 2) * this.$per;
        // 绘图部分
        this.$gameTiles.forEach(function (row) {
            row.forEach(function (e) {
                // e.
            });
        });
        // 重新生成一个块
        var item = this.$nextList.dequeue();
        this.drawElement(item[0], item[1]);
        console.info('重新画一个', item);
        console.log('全局?', $gameTiles);
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
        console.log('autoKick:', (this.$baseX + tileCount) * this.$per, maxWdt);
        while ((this.$baseX + tileCount) * this.$per > maxWdt) {
            this.moveLeft();
        }
    };
    Main.prototype.repeatProc = function (proc) {
        this.interval++ % 2 === 0 && proc.call(this);
        this.interval > 1e5 && (this.interval = 0);
        return true;
    };
    /**
     * 检测是否已经连击
    */
    Main.prototype.hasRepeat = function (hash) {
        return !!this.$ctrlBtns[hash].start;
    };
    Main.prototype.startRepeatProc = function (hash, proc) {
        var _this = this;
        if (this.$ctrlBtns[hash].start)
            return null;
        // 防止同时按下左右, 而且以最后按下的为主
        (hash === 37 || hash === 39) && this.$currLorR !== hash && this.$ctrlBtns[this.$currLorR] && this.$ctrlBtns[this.$currLorR].start && this.stopRepeatProc(this.$currLorR);
        /* 心跳定时器 - 貌似没有interval流畅，也许是游戏太简单
            this.$keyMap[hash].proc = this.repeatProc.bind(this, proc);
            egret.startTick(this.$keyMap[hash], this);
        */
        proc.call(this);
        this.tms = Date.now();
        this.$ctrlBtns[hash].tap = egret.setTimeout(function () {
            if (_this.$ctrlBtns[hash].tap) {
                _this.$ctrlBtns[hash].proc = proc.bind(_this);
                /* 心跳定时器 - 貌似没有interval流畅，也许是游戏太简单
                    this.$ctrlBtns[hash].proc = this.repeatProc.bind(this, proc);
                    egret.startTick(this.$ctrlBtns[hash].proc, this);
                    this.$ctrlBtns[hash].start = true;
                */
                _this.$ctrlBtns[hash].start = egret.setInterval(function () { return _this.$ctrlBtns[hash].start && proc.call(_this); }, _this, 20);
                (hash === 37 || hash === 39) && (_this.$currLorR = hash);
            }
        }, this, 80);
    };
    /**
     * 停止长按点击
    */
    Main.prototype.stopRepeatProc = function (hash) {
        this.createText.call(this, Date.now() - this.tms);
        egret.clearTimeout(this.$ctrlBtns[hash].tap);
        this.$ctrlBtns[hash].tap = null;
        if (!this.hasRepeat(hash))
            return null; // 防止提前解决了左右冲突导致出错
        // egret.stopTick(this.$ctrlBtns[hash].proc, this);
        // this.$ctrlBtns[hash].start = false;
        this.$ctrlBtns[hash].start && egret.clearInterval(this.$ctrlBtns[hash].start);
        this.$ctrlBtns[hash].start = false;
    };
    Main.prototype.createText = function (text) {
        var tf = new egret.TextField();
        tf.x = 0;
        tf.y = this.$textPos;
        this.$textPos += 20;
        tf.text = '按下' + text;
        tf.size = 14;
        this.$playground.addChild(tf);
    };
    /**
     * 处理 keydown
     * @param keyCode {number} 按键码
    */
    Main.prototype.keyDownHandler = function (keyCode) {
        switch (keyCode) {
            case 38:// up
                this.rotate();
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
                // this.startRepeatProc(keyCode, this.down);
                this.down();
            default:
                break;
        }
    };
    // keyup
    Main.prototype.keyUpHandler = function (keyCode) {
        this.stopRepeatProc(keyCode);
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map