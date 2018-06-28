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
        _this.$gameTileSprs = [];
        _this.$gameTileShps = [];
        _this.$gmTilesShp = null;
        _this.$vertCount = 0; // 垂直个数
        _this.$per = 0; // 单个块的宽高
        _this.$horzCount = 10; // 水平单个块个数
        _this.$baseX = 0; // x轴基准, 左右距离
        _this.$baseY = 0; // y轴基准，上下距离
        _this.$tShapes = null; // 所有图形的定义
        // private $currTshape: string = 'z'; // 当前控制的图形
        // private $currTshapeData: Array<Array<number>> = []; // 这是坐标数组
        // private $currRealPos: Array<Array<number>> = [];
        // private $currTshapeCount: number = 0; // 当前图形的所有分类
        // private $currTshapeIdx: number = 0; // 当前图形的下标
        // private $currTshapeWdt: number = 0; // 当前tetromino宽度 1. 检测边界 2. 定义初始出现位置
        // private $currTshapeHgt: number = 0; // 高度
        // private $ctrlSpr: egret.Sprite = null; // 被控制的Sripte
        // private $ctrlTiles: Array<egret.Shape> = []; // 被控制的shape
        // private $currLorR: any = null; // 记录已经按下的左或右，防止冲突
        _this.$tetromino = {
            char: '',
            hNum: 0,
            vNum: 0,
            spr: null,
            tetData: [],
            tetTiles: [],
            realPos: [],
            count: 0,
            idx: 0,
            hasPressKey: 0
        };
        _this.$particleEffect = {
            txrs: [],
            partBox: null,
            partSys: null,
            task: []
        };
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
        // /**
        //  * @param {Array} tetData 下一个图形的data
        //  * @inner
        // */
        // public shouldRotate(tetData): boolean {
        //     const {$baseX, $baseY, calcWH} = this;
        //     const realPos = tetData.map(e => [e[0] + $baseX, e[1] + $baseY]);
        //     const should = false;
        //     realPos.forEach(e => { 
        //         const [x, y] = [...e];
        //     });
        //     console.log('真实pos:', realPos);
        //     console.log('宽高:', hNum, vNum);
        //     return should;
        // }
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
        var vertCount = ~~(pgrHgt / per);
        this.$vertCount = vertCount = vertCount > 20 ? 20 : vertCount;
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
        // 初始化控制块坐标
        this.$baseX = ~~(this.$horzCount / 2 - 2);
        this.$baseY = 0;
        this.$tetromino.spr.y = 0;
        this.$tetromino.spr.x = ~~(this.$horzCount / 2 - 2) * this.$per;
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
        // 适配游戏区域方块画布大小
        Object.assign(this.$gmTilesShp, {
            width: pgrWdt,
            height: pgrHgt,
            name: 'gmTilesShp'
        });
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
    Main.prototype.drawTile = function (g, bg, cre, shw, scale) {
        g.clear();
        var per = this.$per;
        scale = scale || 1;
        g.beginFill(bg); // 背景色
        g.drawRect(0, 0, per * scale, per);
        g.beginFill(shw); // 阴影颜色
        var mid = ~~(per * scale * .5); // 找中点
        g.drawCircle(mid + 2, mid + 2, per * .3); // 画圆心阴影
        g.beginFill(cre); // 圆心颜色
        g.drawCircle(mid, mid, per * scale * .3); // 画圆心
        g.endFill();
    };
    /**
     * 绘制一个teromino
     * @param {string} char 是一个方块的元素名
     * @param {number} num 这个是要绘制的具体旋转形态
    */
    Main.prototype.drawTetromino = function (char, idx) {
        var _this = this;
        var shp = this.$tShapes[char];
        var per = this.$per;
        var _a = shp.color, bg = _a.bg, shw = _a.shw, cre = _a.cre;
        var tetData = shp.shape[idx];
        var $tetromino = this.$tetromino;
        Object.assign($tetromino, {
            char: char,
            idx: idx,
            tetData: tetData,
            count: shp.shape.length,
        });
        // 计算tetromino 高度
        var tmp = {
            hNum: [tetData[0][0], tetData[1][0]],
            vNum: [tetData[0][1], tetData[1][1]]
        };
        tetData.forEach(function (e) {
            // 扫一遍的时候，就把高宽计算出来
            e[0] < tmp.hNum[0] && (tmp.hNum[0] = e[0]);
            e[0] > tmp.hNum[1] && (tmp.hNum[1] = e[0]);
            e[1] < tmp.vNum[0] && (tmp.vNum[0] = e[1]);
            e[1] > tmp.vNum[1] && (tmp.vNum[1] = e[1]);
        });
        $tetromino.hNum = tmp.hNum[1] - tmp.hNum[0] + 1;
        $tetromino.vNum = tmp.vNum[1] - tmp.vNum[0] + 1;
        $tetromino.spr.width = $tetromino.hNum * per;
        $tetromino.spr.height = $tetromino.vNum * per;
        tetData.forEach(function (e, i) {
            // 画tile
            var x = e[0];
            var y = e[1];
            var per = _this.$per;
            var tile = $tetromino.tetTiles[i];
            tile.name = x + "_" + y;
            tile.x = x * per;
            tile.y = y * per;
            var g = $tetromino.tetTiles[i].$graphics;
            _this.drawTile(g, bg, cre, shw);
        });
        console.log('interface: ', $tetromino);
    };
    Main.prototype.initUi = function () {
        var _this = this;
        // 先初始化背景
        var bg = this.$bg = new egret.Bitmap();
        var texture = RES.getRes('bg_jpg');
        var wdt = this.$stage.$stageWidth;
        var hgt = this.$stage.$stageHeight;
        bg.name = 'gamebg';
        bg.width = wdt;
        bg.height = hgt;
        bg.texture = texture;
        bg.fillMode = egret.BitmapFillMode.CLIP; //默认情况是拉伸,现改为原图
        this.addChild(bg);
        // 始化游戏区域
        var $playground = this.$playground = new egret.Sprite();
        var $pgr = this.$pgr = this.$playground.$graphics;
        $playground.name = 'playground';
        this.addChild($playground);
        // 初始化更新画布
        var gmTilesShp = this.$gmTilesShp = new egret.Shape();
        $playground.addChild(gmTilesShp);
        // 初始化控制块 
        var spr = this.$tetromino.spr = new egret.Sprite();
        spr.name = 'tetromino';
        for (var i = 4; i--;) {
            var shp = new egret.Shape();
            this.$tetromino.tetTiles.push(shp);
            spr.addChild(shp);
        }
        this.$playground.addChild(spr);
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
        // 生成一个游戏区shape层
        var gmTilesSpr = new egret.Sprite();
        gmTilesSpr.name = 'gmTileSpr';
        var gmTiles = this.$gameTiles = Array.from({ length: vCount }, function (row, rowIdx) {
            var rowTiles = new egret.Sprite();
            var rowTilesRef = [];
            rowTiles.name = "row-" + rowIdx;
            rowTiles.x = rowTiles.y = 0;
            _this.$gameTileShps.push(rowTilesRef);
            _this.$gameTileSprs.push(gmTilesSpr);
            gmTilesSpr.addChild(rowTiles);
            return Array.from({ length: hCount }, function (item, itemIdx) {
                var tileShp = new egret.Shape();
                tileShp.name = rowIdx + "-" + itemIdx;
                tileShp.width = tileShp.height = _this.$per;
                tileShp.x = itemIdx * _this.$per;
                tileShp.y = rowIdx * _this.$per;
                rowTilesRef.push(tileShp);
                rowTiles.addChild(tileShp);
                return null;
            });
        });
        this.$playground.addChild(gmTilesSpr);
        // 随机生成某个块
        var tShapes = this.$tShapes = RES.getRes('preDefine_json');
        var tetrominoNames = Object.keys(tShapes);
        // 生成队列 
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
        this.$tetromino.tetTiles.forEach(function (e) { return e.width = e.height = _this.$per; });
        this.drawTetromino(item[0], item[1]);
        var partBox = this.$particleEffect.partBox = new egret.Sprite();
        partBox.name = 'partBox';
        var playGroundWdt = this.$per * this.$horzCount;
        Object.assign(partBox, {
            x: 0,
            y: 0,
            width: playGroundWdt,
        });
        // Object.assign(particleBox, {
        //     name: "particleBox",
        //     x: 30,
        //     y: 10,
        //     height: 100,
        //     width: 300
        // });
        // this.$playground.addChild(particleBox);
        var txrs = [];
        for (var i = 0; i < 3; i++) {
            var txr = RES.getRes("level" + i + "_png");
            txrs.push(txr);
        }
        this.$particleEffect.txrs = txrs;
        var config = RES.getRes('newParticle_json');
        var part = this.$particleEffect.partSys = new particle.GravityParticleSystem(txrs[0], config);
        Object.assign(part, {
            x: 0,
            y: 0,
            emitterXVariance: playGroundWdt,
            cacheAsBitmap: true
        });
        partBox.addChild(part);
        this.$playground.addChild(partBox);
        // this.$particleEffect.partSys.x = 0;
        // this.$particleEffect.partSys.y = 10;
        // part.start();
    };
    /**
     * @param {boolean=} left 是否为左边界  这里是否合成一个checkPos更好呢？一个对象 {left, right, bottom}
     * @return {boolean} 是否为边界
    */
    Main.prototype.isBorder = function (left) {
        var _a = this, $baseX = _a.$baseX, $baseY = _a.$baseY, $gameTiles = _a.$gameTiles, $tetromino = _a.$tetromino;
        var realPos = $tetromino.realPos = $tetromino.tetData.map(function (e) { return [e[0] + $baseX, e[1] + $baseY]; }); // 计算实际位置
        var _b = this.$tetromino, hNum = _b.hNum, vNum = _b.vNum;
        if (left) {
            if ($baseX <= 0)
                return true;
            // 算左面
            var map_1 = {};
            var leftTiles_1 = [];
            var leftHasTile_1 = false;
            realPos.forEach(function (e) {
                var _a = e.slice(), x = _a[0], y = _a[1];
                map_1[y] ? map_1[y][0] > x && (map_1[y][0] = x) : map_1[y] = e.slice();
            });
            Object.keys(map_1).forEach(function (e) { return leftTiles_1.push(map_1[e].slice()); });
            leftTiles_1.some(function (e) { return $gameTiles[e[1]][e[0] - 1] && (leftHasTile_1 = true); });
            return leftHasTile_1;
        }
        else {
            if (hNum + $baseX >= this.$horzCount)
                return true;
            var map_2 = {};
            var rightTiles_1 = [];
            var rightHasTile_1 = false;
            realPos.forEach(function (e) {
                var _a = e.slice(), x = _a[0], y = _a[1];
                map_2[y] ? map_2[y][0] < x && (map_2[y][0] = x) : map_2[y] = e.slice();
            });
            Object.keys(map_2).forEach(function (e) { return rightTiles_1.push(map_2[e].slice()); });
            rightTiles_1.some(function (e) { return $gameTiles[e[1]][e[0] + 1] && (rightHasTile_1 = true); }); // 是否某一个块的下面有东西
            return rightHasTile_1;
        }
    };
    /**
     * 旋转
    */
    Main.prototype.rotate = function () {
        // if (this.checkPos()) return;
        var idx = (this.$tetromino.idx + 1) % this.$tetromino.count;
        var char = this.$tetromino.char;
        var tetData = this.$tShapes[char].shape[idx];
        // 踢墙
        var canRotate = this.checkRotate(tetData);
        canRotate && this.drawTetromino(this.$tetromino.char, idx);
    };
    /**
     * 向左移一位
     * 1. sprite向左移一位
     * 2. this.$baseX向左移一位，后面记得checkPos就可以了
     * @inner
    */
    Main.prototype.moveLeft = function (force) {
        if (!force && this.isBorder(true))
            return null;
        this.$baseX--;
        this.$tetromino.spr.x -= this.$per;
        // console.log('向左移动了', this.$baseX);
    };
    /**
     * 向右移一位
    */
    Main.prototype.moveRight = function () {
        if (this.isBorder(false))
            return null;
        this.$baseX++;
        this.$tetromino.spr.x += this.$per;
        // console.log('向右移动了', this.$baseX);
    };
    Main.prototype.moveUp = function () {
        this.$baseY--;
        this.$tetromino.spr.y -= this.$per;
    };
    /**
     * 向下移一位
    */
    Main.prototype.down = function () {
        var isCollide = this.checkPos();
        isCollide ? (console.info('可以update了'), this.update()) : (this.$baseY++, this.$tetromino.spr.y += this.$per);
    };
    /**
     * 检查tetromino位置,判断是否update - 条件1: 触底， 条件2: 下面有块
     * @inner
    */
    Main.prototype.checkPos = function () {
        var _this = this;
        var _a = this, $baseX = _a.$baseX, $baseY = _a.$baseY, $vertCount = _a.$vertCount, $gameTiles = _a.$gameTiles, $tetromino = _a.$tetromino;
        var realPos = $tetromino.realPos = $tetromino.tetData.map(function (e) { return [e[0] + $baseX, e[1] + $baseY]; }); // 计算实际位置
        var tetrominoVnum = $tetromino.vNum;
        // 算底
        var map = {};
        var bottomTiles = [];
        realPos.forEach(function (e) {
            var _a = e.slice(), x = _a[0], y = _a[1];
            map[x] ? map[x][1] < y && (map[x][1] = y) : map[x] = e.slice();
        });
        Object.keys(map).forEach(function (e) { return bottomTiles.push(map[e].slice()); });
        // console.log('算出来的底面是: ', bottomTiles);
        // 计算是否块下有障碍物了
        var isCollide = false;
        bottomTiles.some(function (e) {
            $baseY + tetrominoVnum >= _this.$vertCount && (isCollide = true); //是否触底
            !isCollide && $gameTiles[e[1] + 1][e[0]] && (isCollide = true); // 是否某一个块的下面有东西
            return isCollide;
        });
        return isCollide;
    };
    /**
     * 更新gameTiles
    */
    Main.prototype.update = function () {
        var _this = this;
        var _a = this, $tetromino = _a.$tetromino, $gameTiles = _a.$gameTiles;
        $tetromino.realPos.forEach(function (e) {
            $gameTiles[e[1]][e[0]] = 'te-' + $tetromino.char;
        });
        this.cleanUp();
        // 绘图部分
        this.$gameTiles.forEach(function (row, rowIdx) {
            return row.forEach(function (item, itemIdx) {
                if (item === null) {
                    _this.$gameTileShps[rowIdx][itemIdx].$graphics.clear();
                    return;
                }
                var char = item.split('-')[1];
                var _a = _this.$tShapes[char].color, bg = _a.bg, cre = _a.cre, shw = _a.shw;
                _this.drawTile(_this.$gameTileShps[rowIdx][itemIdx].$graphics, bg, cre, shw);
            });
        });
        // 初始化控制块坐标
        this.$baseX = ~~(this.$horzCount / 2);
        this.$baseY = 0;
        $tetromino.spr.y = 0;
        $tetromino.spr.x = ~~(this.$horzCount / 2) * this.$per;
        // 重新生成一个块
        var item = this.$nextList.dequeue();
        this.drawTetromino(item[0], item[1]);
        // console.info('重新画一个', item);
        // console.log('全局?', $gameTiles);
    };
    Main.prototype.cleanUp = function () {
        var _this = this;
        var _a = this, $gameTiles = _a.$gameTiles, $gameTileShps = _a.$gameTileShps, $tShapes = _a.$tShapes, $gameTileSprs = _a.$gameTileSprs, $particleEffect = _a.$particleEffect, $per = _a.$per, $horzCount = _a.$horzCount;
        var fullLine = [];
        var ranges = [];
        var r = [];
        $gameTiles.forEach(function (e, i) {
            e.indexOf(null) === -1 && (fullLine[i] = i);
        });
        fullLine.filter(function (e) { return typeof e === 'number' && e >= 0; }).forEach(function (e) {
            r[0] === undefined && (r = [e, e]);
            e - r[1] === 1 && (r[1] = e);
            e - r[1] > 1 && (ranges.push(r), r = [e, e]);
        });
        r.length > 0 && ranges.push(r);
        ranges.length > 0 && (_b = $particleEffect.task).push.apply(_b, JSON.parse(JSON.stringify(ranges)));
        var showAni = function (r) {
            var min = r[0];
            var num = r[1] - r[0] + 1; // 消除的行数
            var level = num > 3 ? 2 : num > 1 ? 1 : 0;
            var hgt = num * $per;
            Object.assign($particleEffect.partBox, {
                x: 0,
                y: min * $per + 10,
            });
            Object.assign($particleEffect.partSys, {
                width: $horzCount * $per,
                emitAngleVariance: hgt,
                texture: $particleEffect.txrs[level]
            });
            $particleEffect.partSys.start();
            egret.setTimeout(function () {
                _this.$particleEffect.partSys.stop();
                _this.$particleEffect.task.length && showAni(_this.$particleEffect.task.shift());
            }, _this, 60);
        };
        $particleEffect.task.length && showAni($particleEffect.task.shift());
        ranges.forEach(function (e) {
            var idx = e[0];
            var len = e[1] - e[0] + 1;
            $gameTiles.splice(idx, len);
            var newLines = Array.from({ length: len }, function (e) { return Array.from({ length: $horzCount }, function (e) { return null; }); });
            $gameTiles.unshift.apply($gameTiles, newLines);
        });
        var _b;
    };
    /**
     * 计算tet所占的宽高格子数
     * @param {Array} tetData 图形的data
    */
    Main.prototype.calcWH = function (tetData) {
        // 计算tetromino 高度
        var tmp = {
            hNum: [tetData[0][0], tetData[1][0]],
            vNum: [tetData[0][1], tetData[1][1]]
        };
        tetData.forEach(function (e) {
            e[0] < tmp.hNum[0] && (tmp.hNum[0] = e[0]);
            e[0] > tmp.hNum[1] && (tmp.hNum[1] = e[0]);
            e[1] < tmp.vNum[0] && (tmp.vNum[0] = e[1]);
            e[1] > tmp.vNum[1] && (tmp.vNum[1] = e[1]);
        });
        var hNum = tmp.hNum[1] - tmp.hNum[0] + 1;
        var vNum = tmp.vNum[1] - tmp.vNum[0] + 1;
        return { hNum: hNum, vNum: vNum };
    };
    /**
     * 踢墙
     * @param {Array} tetData 下一个图形的data
     * @inner
    */
    Main.prototype.checkRotate = function (tetData) {
        // const {$tetromino, $per, $baseY, $horzCount, $vertCount} = this;
        // const hNum = $tetromino.hNum;
        // const sprPosX = $tetromino.spr.x;
        // sprPosX < 0 && this.moveRight(); // 如果sprite < 0 向右移一位
        // const maxWdt = $per * $horzCount;
        // while((this.$baseX + hNum) * $per > maxWdt) { // 如果sprite + baseY
        //     this.moveLeft();
        //     console.log('autoKick:', (this.$baseX + hNum) * $per, maxWdt);
        // }
        var _this = this;
        var _a = this, $horzCount = _a.$horzCount, $gameTiles = _a.$gameTiles, $tetromino = _a.$tetromino;
        var _b = this.calcWH(tetData), hNum = _b.hNum, vNum = _b.vNum;
        // 这部分检测当前位置是否可以旋转
        var check = function (tetData, left, up) {
            if (left === void 0) { left = 0; }
            if (up === void 0) { up = 0; }
            var can = true;
            var overflowY = vNum + _this.$baseY - up > _this.$vertCount;
            overflowY ? can = false : tetData.some(function (e) {
                $gameTiles[e[1] - up + _this.$baseY][e[0] - left + _this.$baseX] && (can = false);
                return !can;
            });
            return can;
        };
        var moveLeft = this.$baseX + hNum - $horzCount; // 大于 0 则踢墙
        var left = moveLeft > 0 ? moveLeft : 0;
        var canRotate = check(tetData, left);
        canRotate && moveLeft > 0 && Array.from({ length: moveLeft }, function (e) { return _this.moveLeft(true); });
        // 如果不行，往上几格行不行？
        var up = 0;
        if (!canRotate) {
            var max = $tetromino.char === 'i' ? 3 : 2; // 除了长条，最大往上踢两格
            for (var i = 1; i <= max; i++) {
                if (check(tetData, left, i) === true) {
                    up = i;
                    canRotate = true;
                    break;
                }
            }
            canRotate && up > 0 && Array.from({ length: up }, function (e) { return _this.moveUp(); });
            canRotate && moveLeft > 0 && Array.from({ length: left }, function (e) { return _this.moveLeft(true); });
        }
        return canRotate;
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
        (hash === 37 || hash === 39) && this.$tetromino.hasPressKey !== hash && this.$ctrlBtns[this.$tetromino.hasPressKey] && this.$ctrlBtns[this.$tetromino.hasPressKey].start && this.stopRepeatProc(this.$tetromino.hasPressKey);
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
                (hash === 37 || hash === 39) && (_this.$tetromino.hasPressKey = hash);
            }
        }, this, 80);
    };
    /**
     * 停止长按点击
    */
    Main.prototype.stopRepeatProc = function (hash) {
        // this.createText.call(this, Date.now() - this.tms)
        this.$ctrlBtns[hash] && egret.clearTimeout(this.$ctrlBtns[hash].tap);
        this.$ctrlBtns[hash] && (this.$ctrlBtns[hash].tap = null);
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
                // const s = Object.keys(this.$tShapes)[this.i++];
                // this.$currTshape = s;
                // this.$currTshapeIdx = 0;
                // this.$currTshapeCount = this.$tShapes[this.$currTshape].shape.length;
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