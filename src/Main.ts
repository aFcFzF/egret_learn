/**
 * @file 主文件
 * @author afcfzf<9301462@qq.com>
*/

interface Tetromino {
    char: string;
    hNum: number; // 当前tetromino宽度 1. 检测边界 2. 定义初始出现位置
    vNum: number;
    spr: egret.Sprite; // 先定义为显示容器，因为可能后面有图片
    tetData: Array<Array<number>>; // 原始坐标数据
    tetTiles: Array<egret.Shape>; // 坐标对应的shape
    realPos: Array<Array<number>>; // 每个tile的真实pos
    count: number; // 该图形下不同角度的数量
    idx: number; // 当前角度
    hasPressKey: number; // 记录已经按下的左或右，防止冲突 
}

interface ParticleEffect {
    txrs: Array<egret.Texture>; // 贴图
    partBox: egret.Sprite; // 到时做特效容器
    partSys: particle.GravityParticleSystem;
    task: Array<Array<number>>;
}

class Main extends egret.DisplayObjectContainer {
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.init, this);
    }

    private $textPos: number = 0;
    private $bg: egret.Bitmap = null; // 背景
    private $playground: egret.Sprite = null; // 方块区域
    private $pgr: egret.Graphics = null; // 方块背景（绘制）
    private $gameTiles: Array<Array<any>> = []; // playground 里面的所有方块
    private $gameTileSprs: Array<egret.Sprite> = [];
    private $gameTileShps: Array<Array<egret.Shape>> = [];
    private $gmTilesShp: egret.Shape= null;
    private $vertCount = 0; // 垂直个数
    private $per: number = 0; // 单个块的宽高
    private $horzCount: number = 10; // 水平单个块个数
    private $baseX: number = 0; // x轴基准, 左右距离
    private $baseY: number = 0; // y轴基准，上下距离
    private $tShapes: Object = null; // 所有图形的定义
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

    private $tetromino: Tetromino = {
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
    }

    private $particleEffect: ParticleEffect = {
        txrs: [],
        partBox: null,
        partSys: null,
        task: []
    }

    private $ctrlBtns: Object = {
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
    private $nextList: any = null;
    

    public init() {
        // 屏幕显示模式
        this.stage.scaleMode = egret.StageScaleMode.NO_SCALE;
        this.stage.addEventListener(egret.Event.RESIZE, this.paint, this);
        // 这里加egret.Event.RESIZE 无效
        // window.addEventListener('resize', this.paint.bind(this));

        window.addEventListener('keydown', (e: KeyboardEvent) => this.keyDownHandler(e.keyCode));
        window.addEventListener('keyup', (e: KeyboardEvent) => this.keyUpHandler(e.keyCode));

        // 必须等load完分组，然后才load资源
        const onResourceLoadComplete = (): void => {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, onResourceLoadComplete, this);
            console.log('载入ui');

            // 初始化ui
            this.initUi();

            // 初始化逻辑
            this.initLogic();
        }
    
        const preload = (): void => {
            RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, onResourceLoadComplete, this);
            RES.loadGroup('preload');
        }

        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, this);
        RES.loadConfig('resource/default.res.json', 'resource/');

    }

    public paint() {
        // $bg 是整个背景，pgr是playground.$graphics
        const wdt = this.$stage.$stageWidth;
        const hgt = this.$stage.$stageHeight;

        // 屏幕变化，适配背景
        Object.assign(this.$bg, {
            width: wdt,
            height: hgt
        });

        // 计算游戏区域
        let pgrWdt = wdt - 100;
        let pgrHgt = hgt - 120;
        const horzCount = this.$horzCount;
        let per = this.$per = ~~(pgrWdt / horzCount);
        let vertCount = ~~(pgrHgt / per);
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
        for (let d = 0; d < vertCount; d++) {
            for (let p = 0; p < horzCount; p++) {
                this.$pgr.lineStyle(0);
                (p + d) % 2 === 0 ? this.$pgr.beginFill(0x3D383E, 1) : this.$pgr.beginFill(0x4A4358, 1);   
                this.$pgr.drawRoundRect(p * per, d * per, per, per, 3);
                this.$pgr.endFill();
                if (d === vertCount - 1) {
                    this.$pgr.lineStyle(2, 0x000000, .2, false, '', '', '' , 0, [5]);
                    this.$pgr.moveTo(per * (p + 1), 0);
                    this.$pgr.lineTo(per * (p + 1), pgrHgt);
                }  
            }
                this.$pgr.lineStyle(2, 0x000000, .2, false, '', '', '' , 0, [5]);
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
        const ctrlGroup = this.getChildByName('btnGroup');
        ctrlGroup.width = wdt - 20;
        const span = ~~((ctrlGroup.width - 4 * 80) / 5);
        ctrlGroup.height = 2 * 80 + span;
        ctrlGroup.x = 10;
        ctrlGroup.y = ~~(pgrHgt + 10 + (hgt - 10 - pgrHgt) / 2) - ~~((ctrlGroup.height - span) * 3 / 4) - 10;
        const btnCount = 4;
        ['37', '39', '40'].forEach((e, idx) => {
            console.log('距离', (span + 80) * idx);
            this.$ctrlBtns[e].spr.x = (span + 80) * idx;
            this.$ctrlBtns[e].spr.y = span + 80;
        });
        this.$ctrlBtns['38'].spr.x = ctrlGroup.width - 80;
        this.$ctrlBtns['38'].spr.y = 0;
        
    }

    public drawTile(g: egret.Graphics, bg: number, cre: number, shw: number, scale?: number) {
            g.clear();
            const per = this.$per;
            scale  = scale || 1;
            g.beginFill(bg); // 背景色
            g.drawRect(0, 0, per * scale, per);
            g.beginFill(shw); // 阴影颜色
            const mid = ~~(per * scale * .5); // 找中点
            g.drawCircle(mid + 2, mid + 2, per * .3); // 画圆心阴影
            g.beginFill(cre); // 圆心颜色
            g.drawCircle(mid, mid, per * scale * .3); // 画圆心
            g.endFill();
    }

    /**
     * 绘制一个teromino
     * @param {string} char 是一个方块的元素名
     * @param {number} num 这个是要绘制的具体旋转形态
    */
    public drawTetromino(char, idx) {
        const shp = this.$tShapes[char];
        const per = this.$per;
        const {bg, shw, cre} = shp.color;
        const tetData = shp.shape[idx];
        const $tetromino = this.$tetromino;

        Object.assign($tetromino, {
            char,
            idx,
            tetData,
            count: shp.shape.length,
        })

        // 计算tetromino 高度
        const tmp = {
            hNum: [tetData[0][0], tetData[1][0]],
            vNum: [tetData[0][1], tetData[1][1]]
        };
        tetData.forEach(e => {
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

        tetData.forEach((e, i) => {
            // 画tile
            const x = e[0];
            const y = e[1];
            const per = this.$per;
            const tile = $tetromino.tetTiles[i];
            tile.name = `${x}_${y}`;
            tile.x = x * per;
            tile.y = y * per;
            const g = $tetromino.tetTiles[i].$graphics;
            this.drawTile(g, bg, cre, shw);
        });        
        console.log('interface: ', $tetromino);
    }

    public initUi(): void {
        // 先初始化背景
        const bg:egret.Bitmap = this.$bg = new egret.Bitmap(); 
        const texture = RES.getRes('bg_jpg');
        const wdt = this.$stage.$stageWidth;
        const hgt = this.$stage.$stageHeight;
        bg.name = 'gamebg';
        bg.width = wdt;
        bg.height = hgt;
        bg.texture = texture;
        bg.fillMode = egret.BitmapFillMode.CLIP; //默认情况是拉伸,现改为原图
        this.addChild(bg);

        // 始化游戏区域
        const $playground = this.$playground = new egret.Sprite();
        const $pgr = this.$pgr = this.$playground.$graphics;
        $playground.name = 'playground';
        this.addChild($playground);

        // 初始化更新画布
        const gmTilesShp = this.$gmTilesShp = new egret.Shape();
        $playground.addChild(gmTilesShp);

        // 初始化控制块 
        const spr = this.$tetromino.spr = new egret.Sprite();
        spr.name = 'tetromino';
        for (let i = 4; i--;) {
            const shp = new egret.Shape();
            this.$tetromino.tetTiles.push(shp);
            spr.addChild(shp);
        }
        this.$playground.addChild(spr);

        // 初始化按钮
        const btnGroup = new egret.Sprite();
        btnGroup.name = 'btnGroup';
        Object.keys(this.$ctrlBtns).forEach(e => {
            const btnItem = this.$ctrlBtns[e];
            btnItem.spr = new egret.Sprite();
            btnItem.spr.name = btnItem.sprName;
            btnItem.bg = new egret.Bitmap(RES.getRes(this.$ctrlBtns[e].bg));
            btnItem.bg.fillMode = egret.BitmapFillMode.SCALE;
            btnItem.spr.width = btnItem.bg.width = 80;
            btnItem.spr.height = btnItem.bg.height = 80;
            btnItem.spr.touchEnabled = true;
            btnItem.spr.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.keyDownHandler.bind(this, +e), this);
            btnItem.spr.addEventListener(egret.TouchEvent.TOUCH_END, this.keyUpHandler.bind(this, +e), this);
            btnItem.spr.addChild(btnItem.bg);
            btnGroup.addChild(btnItem.spr);
        });
        this.addChild(btnGroup);
        
        // 绘制具体流程，响应屏幕适配
        this.paint();
    }

    // 初始化游戏
    public initLogic(): void {
        const hCount = this.$horzCount;
        const vCount = this.$vertCount;

        // 生成一个游戏区shape层
        const gmTilesSpr: egret.Sprite = new egret.Sprite();
        gmTilesSpr.name = 'gmTileSpr';
        const gmTiles = this.$gameTiles = Array.from({length: vCount}, (row, rowIdx) =>{
            const rowTiles = new egret.Sprite();
            const rowTilesRef = [];
            rowTiles.name = `row-${rowIdx}`;
            rowTiles.x = rowTiles.y =0;
            this.$gameTileShps.push(rowTilesRef);
            this.$gameTileSprs.push(gmTilesSpr);
            gmTilesSpr.addChild(rowTiles);
            return Array.from({length: hCount}, (item, itemIdx) => {
                const tileShp = new egret.Shape();
                tileShp.name = `${rowIdx}-${itemIdx}`;
                tileShp.width = tileShp.height = this.$per;
                tileShp.x = itemIdx * this.$per;
                tileShp.y = rowIdx * this.$per;
                rowTilesRef.push(tileShp);
                rowTiles.addChild(tileShp);
                return null;
            });
        });
        this.$playground.addChild(gmTilesSpr);

        // 随机生成某个块
        const tShapes = this.$tShapes = RES.getRes('preDefine_json');
        const tetrominoNames = Object.keys(tShapes);

        // 生成队列 
        const nList = this.$nextList = {
            _list: [],

            dequeue() {
                this.enqueue();
                return this._list.shift();
            },

            enqueue() {
                const randomChar =  tetrominoNames[~~(Math.random() * tetrominoNames.length)];
                const len = tShapes[randomChar].shape.length;
                const randomIdx = ~~(Math.random() * len);
                this._list.push([randomChar, randomIdx]);
            },

            size() {
                return this._list.length;
            }
        }

        // 生成随方块队列-10个
        Array.from({length: 10}, e => nList.enqueue());

        const item = nList.dequeue();
        console.log('初始化方块', item);
        this.$tetromino.tetTiles.forEach(e => e.width = e.height = this.$per);
        this.drawTetromino(item[0], item[1]);


        const partBox = this.$particleEffect.partBox = new egret.Sprite();
        partBox.name = 'partBox';
        const playGroundWdt = this.$per * this.$horzCount;

        Object.assign(partBox, {
            x: 0,
            y: 0,
            width: playGroundWdt,
        })
        
        const txrs = [];
        for(let i = 0; i < 3; i++) {
            const txr = RES.getRes(`level${i}_png`);
            txrs.push(txr);
        }
        this.$particleEffect.txrs = txrs;

        const config = RES.getRes('newParticle_json');
        const part = this.$particleEffect.partSys = new particle.GravityParticleSystem(txrs[0], config);
        Object.assign(part, {
            x: 0,
            y: 0,
            emitterXVariance: playGroundWdt,
            cacheAsBitmap: true
        });

        partBox.addChild(part);
        this.$playground.addChild(partBox);

        const strategy = new TetStrategy();
        strategy.start();

        // this.$particleEffect.partSys.x = 0;
        // this.$particleEffect.partSys.y = 10;
        // part.start();
    }


    /**
     * @param {boolean=} left 是否为左边界  这里是否合成一个checkPos更好呢？一个对象 {left, right, bottom}
     * @return {boolean} 是否为边界
    */
    public isBorder(left: Boolean): boolean {
        const {$baseX, $baseY, $gameTiles, $tetromino} = this;
        const realPos = $tetromino.realPos = $tetromino.tetData.map(e => [e[0] + $baseX, e[1] + $baseY]); // 计算实际位置
        const {hNum, vNum} = this.$tetromino;

        if (left) {
            if ($baseX <= 0) return true;
            // 算左面
            const map = {};
            const leftTiles = [];
            let leftHasTile = false;
            realPos.forEach(e => {
                const [x, y] = [...e];
                map[y] ? map[y][0] > x && (map[y][0] = x) : map[y] = [...e];
            });
            Object.keys(map).forEach(e => leftTiles.push([...map[e]]));
            leftTiles.some(e => $gameTiles[e[1]][e[0] - 1] && (leftHasTile = true));
            return leftHasTile;
        } else {
            if ( hNum + $baseX >= this.$horzCount) return true;
            const map = {};
            const rightTiles = [];
            let rightHasTile = false;
            realPos.forEach(e => {
                const [x, y] = [...e];
                map[y] ? map[y][0] < x && (map[y][0] = x) : map[y] = [...e];
            });
            Object.keys(map).forEach(e => rightTiles.push([...map[e]]));
            rightTiles.some(e => $gameTiles[e[1]][e[0] + 1] && (rightHasTile = true)); // 是否某一个块的下面有东西
            return rightHasTile;
        }
    }

    /**
     * 旋转
    */
    public rotate(): void {
        // if (this.checkPos()) return;
        const idx = (this.$tetromino.idx + 1) % this.$tetromino.count;
        const char = this.$tetromino.char;
        const tetData = this.$tShapes[char].shape[idx];

        // 踢墙
        const canRotate = this.checkRotate(tetData);

        canRotate && this.drawTetromino(this.$tetromino.char, idx); 
    }

    /**
     * 向左移一位
     * 1. sprite向左移一位
     * 2. this.$baseX向左移一位，后面记得checkPos就可以了
     * @inner
    */
    public moveLeft(force?): void {
        if (!force && this.isBorder(true)) return null;
        this.$baseX--;
        this.$tetromino.spr.x -= this.$per;
        // console.log('向左移动了', this.$baseX);
    }

    /**
     * 向右移一位
    */
    public moveRight(): void {
        if (this.isBorder(false)) return null;
        this.$baseX++;
        this.$tetromino.spr.x += this.$per;
        // console.log('向右移动了', this.$baseX);
    }

    public moveUp(): void {
        this.$baseY--;
        this.$tetromino.spr.y -= this.$per;
    }

    /**
     * 向下移一位
    */
    public down(): void {
        const isCollide = this.checkPos();
        isCollide ? (console.info('可以update了'), this.update()) : (this.$baseY++, this.$tetromino.spr.y += this.$per); 
    }

    /**
     * 检查tetromino位置,判断是否update - 条件1: 触底， 条件2: 下面有块
     * @inner
    */
    public checkPos(): boolean {
        const {$baseX, $baseY, $vertCount, $gameTiles, $tetromino} = this;
        const realPos = $tetromino.realPos = $tetromino.tetData.map(e => [e[0] + $baseX, e[1] + $baseY]); // 计算实际位置
        const tetrominoVnum = $tetromino.vNum;

        // 算底
        let map = {};
        const bottomTiles = [];
        realPos.forEach(e => {
            const [x, y] = [...e];
            map[x] ? map[x][1] < y && (map[x][1] = y) : map[x] = [...e]; 
        });
        Object.keys(map).forEach(e => bottomTiles.push([...map[e]]));

        // console.log('算出来的底面是: ', bottomTiles);

        // 计算是否块下有障碍物了
        let isCollide = false;
        bottomTiles.some(e => {
            $baseY + tetrominoVnum >= this.$vertCount && (isCollide = true); //是否触底
            !isCollide && $gameTiles[e[1] + 1][e[0]] && (isCollide = true); // 是否某一个块的下面有东西
            return isCollide;
        });

        return isCollide;
    }

    /**
     * 更新gameTiles
    */
    public update(): void {
        const {$tetromino, $gameTiles} = this;
        $tetromino.realPos.forEach(e => {
            $gameTiles[e[1]][e[0]] = 'te-'+ $tetromino.char;
        });

        this.cleanUp();

        // 绘图部分
        this.$gameTiles.forEach((row, rowIdx) => 
            row.forEach((item, itemIdx) => {
                if (item === null) {
                    this.$gameTileShps[rowIdx][itemIdx].$graphics.clear();
                    return;
                }
                const char = item.split('-')[1];
                const {bg, cre, shw} = this.$tShapes[char].color;
                this.drawTile(this.$gameTileShps[rowIdx][itemIdx].$graphics, bg, cre, shw);
            })
        );

        // 初始化控制块坐标
        this.$baseX = ~~(this.$horzCount / 2);
        this.$baseY = 0;
        $tetromino.spr.y = 0;
        $tetromino.spr.x = ~~(this.$horzCount / 2) * this.$per;


        // 重新生成一个块
        const item = this.$nextList.dequeue();
        this.drawTetromino(item[0], item[1]);
        // console.info('重新画一个', item);
        // console.log('全局?', $gameTiles);
    }

    public cleanUp() {
        const {$gameTiles, $gameTileShps, $tShapes, $gameTileSprs, $particleEffect, $per, $horzCount} = this;
        const fullLine = [];
        const ranges = [];
        let r = [];

        $gameTiles.forEach((e, i) => {
            e.indexOf(null) === -1 && (fullLine[i] = i);
        });

        fullLine.filter(e => typeof e === 'number' && e >= 0).forEach(e => {
            r[0] === undefined && (r = [e , e]);
            e - r[1] === 1 && (r[1] = e);
            e - r[1] > 1 && (ranges.push(r), r =[e, e]);
        });

        r.length > 0 && ranges.push(r);
        ranges.length > 0 && $particleEffect.task.push(...JSON.parse(JSON.stringify(ranges)));

        
        const showAni = (r) => {
            const min = r[0];
            const num = r[1] - r[0] + 1; // 消除的行数
            const level = num > 3 ? 2 : num > 1 ? 1 : 0;
            const hgt = num * $per;

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
            egret.setTimeout(() => {
                this.$particleEffect.partSys.stop();
                this.$particleEffect.task.length && showAni(this.$particleEffect.task.shift());
            }, this, 60);

        };
        $particleEffect.task.length && showAni($particleEffect.task.shift());

        ranges.forEach(e => {
            const idx = e[0];
            const len = e[1] - e[0] + 1;
            $gameTiles.splice(idx, len);
            const newLines = Array.from({length: len}, e => Array.from({length: $horzCount}, e => null));
            $gameTiles.unshift(...newLines);
        });

        
    }

    /**
     * 计算tet所占的宽高格子数
     * @param {Array} tetData 图形的data
    */
    public calcWH(tetData): any {
        // 计算tetromino 高度
        const tmp = {
            hNum: [tetData[0][0], tetData[1][0]],
            vNum: [tetData[0][1], tetData[1][1]]
        };

        tetData.forEach(e => {
            e[0] < tmp.hNum[0] && (tmp.hNum[0] = e[0]);
            e[0] > tmp.hNum[1] && (tmp.hNum[1] = e[0]);
            e[1] < tmp.vNum[0] && (tmp.vNum[0] = e[1]);
            e[1] > tmp.vNum[1] && (tmp.vNum[1] = e[1]);
        });

        const hNum = tmp.hNum[1] - tmp.hNum[0] + 1;
        const vNum = tmp.vNum[1] - tmp.vNum[0] + 1;
        return {hNum, vNum};
    }

    /**
     * 踢墙
     * @param {Array} tetData 下一个图形的data
     * @inner
    */
    public checkRotate(tetData): boolean { 
        // const {$tetromino, $per, $baseY, $horzCount, $vertCount} = this;
        // const hNum = $tetromino.hNum;
        // const sprPosX = $tetromino.spr.x;
        // sprPosX < 0 && this.moveRight(); // 如果sprite < 0 向右移一位
        // const maxWdt = $per * $horzCount;
        // while((this.$baseX + hNum) * $per > maxWdt) { // 如果sprite + baseY
        //     this.moveLeft();
        //     console.log('autoKick:', (this.$baseX + hNum) * $per, maxWdt);
        // }

        const {$horzCount, $gameTiles, $tetromino} = this;
        const {hNum, vNum} = this.calcWH(tetData);

        
        // 这部分检测当前位置是否可以旋转
        const check = (tetData, left = 0, up = 0) => {
            let can = true;
            const overflowY = vNum + this.$baseY - up > this.$vertCount;
            overflowY ? can = false : tetData.some(e => {
                $gameTiles[e[1] - up + this.$baseY][e[0] - left + this.$baseX] && (can = false);
                return !can;
            });
            return can;
        };

        const moveLeft = this.$baseX + hNum - $horzCount; // 大于 0 则踢墙
        const left = moveLeft > 0 ? moveLeft : 0; 
        let canRotate = check(tetData, left);

        canRotate && moveLeft > 0 &&　Array.from({length: moveLeft}, e => this.moveLeft(true));

        // 如果不行，往上几格行不行？
        let up = 0;
        if (!canRotate) {
            const max = $tetromino.char === 'i' ? 3 : 2; // 除了长条，最大往上踢两格
            for(let i = 1; i <= max; i++) {
                if (check(tetData, left, i) === true) {
                    up = i;
                    canRotate = true;
                    break;
                }
            }
            canRotate && up > 0 && Array.from({length: up}, e => this.moveUp());
            canRotate && moveLeft > 0 &&　Array.from({length: left}, e => this.moveLeft(true));
        }

        return canRotate;

    }

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
    private i: number = 0;

    private interval: number = 0;

    public repeatProc (proc: Function): boolean {
        this.interval++ % 2 === 0  && proc.call(this);
        this.interval > 1e5 && (this.interval = 0);
        return true;  
    }

    /**
     * 检测是否已经连击
    */
    public hasRepeat(hash) {
        return !!this.$ctrlBtns[hash].start;
    }

    /**
     * 开始长按点击
    */
    private tms: number = 0;
    public startRepeatProc(hash: number, proc: Function): void {
        if (this.$ctrlBtns[hash].start) return null;
        // 防止同时按下左右, 而且以最后按下的为主
        (hash === 37 || hash === 39) && this.$tetromino.hasPressKey !== hash && this.$ctrlBtns[this.$tetromino.hasPressKey] && this.$ctrlBtns[this.$tetromino.hasPressKey].start && this.stopRepeatProc(this.$tetromino.hasPressKey);
        /* 心跳定时器 - 貌似没有interval流畅，也许是游戏太简单
            this.$keyMap[hash].proc = this.repeatProc.bind(this, proc);
            egret.startTick(this.$keyMap[hash], this);
        */
        proc.call(this);
        this.tms = Date.now();
        this.$ctrlBtns[hash].tap = egret.setTimeout(() => {
            if (this.$ctrlBtns[hash].tap) {
                this.$ctrlBtns[hash].proc = proc.bind(this);
                /* 心跳定时器 - 貌似没有interval流畅，也许是游戏太简单
                    this.$ctrlBtns[hash].proc = this.repeatProc.bind(this, proc);
                    egret.startTick(this.$ctrlBtns[hash].proc, this);
                    this.$ctrlBtns[hash].start = true;
                */
                 this.$ctrlBtns[hash].start = egret.setInterval(() => this.$ctrlBtns[hash].start && proc.call(this), this, 20);
                 (hash === 37 || hash === 39) && (this.$tetromino.hasPressKey = hash);
            }
        }, this, 80);
        
    }

    /**
     * 停止长按点击
    */
    public stopRepeatProc(hash: number): void {
        // this.createText.call(this, Date.now() - this.tms)
        this.$ctrlBtns[hash] && egret.clearTimeout(this.$ctrlBtns[hash].tap);
        this.$ctrlBtns[hash] && (this.$ctrlBtns[hash].tap = null);
        if (!this.hasRepeat(hash)) return null; // 防止提前解决了左右冲突导致出错
        // egret.stopTick(this.$ctrlBtns[hash].proc, this);
        // this.$ctrlBtns[hash].start = false;
        this.$ctrlBtns[hash].start && egret.clearInterval(this.$ctrlBtns[hash].start);
        this.$ctrlBtns[hash].start = false;
    }

    public createText(text) {
        const tf = new egret.TextField();
        tf.x = 0;
        tf.y = this.$textPos;
        this.$textPos+= 20;
        tf.text = '按下' + text;
        tf.size = 14;
        this.$playground.addChild(tf);
    }


    /**
     * 处理 keydown
     * @param keyCode {number} 按键码
    */
    public keyDownHandler(keyCode: number): void {
        switch(keyCode) {
            case 38: // up
                this.rotate();
                break;
            case 32:  // space
                // const s = Object.keys(this.$tShapes)[this.i++];
                // this.$currTshape = s;
                // this.$currTshapeIdx = 0;
                // this.$currTshapeCount = this.$tShapes[this.$currTshape].shape.length;
                break;
            case 37: // left
                this.startRepeatProc(keyCode, this.moveLeft);
                break;
            case 39: // right
                this.startRepeatProc(keyCode, this.moveRight);
                break;
            case 40: // down
                // this.startRepeatProc(keyCode, this.down);
                this.down();
            default: 
                break;
        }
    }

    // keyup
    public keyUpHandler(keyCode: number): void {
        this.stopRepeatProc(keyCode);
    }
}
