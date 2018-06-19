/**
 * @file 主文件
 * @author afcfzf<9301462@qq.com>
*/

class Main extends egret.DisplayObjectContainer {
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.init, this);
    }
    private $textPos: number = 0;
    private $bg: egret.Bitmap = null; // 背景
    private $playground: egret.Sprite = null; // 方块区域
    private $pgr: egret.Graphics = null; // 方块背景（绘制）
    private $vertCount = 0; // 垂直个数
    private $per: number = 0; // 单个块的宽高
    private $horzCount: number = 10; // 水平单个块个数
    private $baseY: number = 0; // 基准，顶点Y轴，用于求左右移动的距离
    private $tShapes: Object = null; // 所有图形的定义
    private $currTshape: string = 'z'; // 当前控制的图形
    private $currTshapeData: Array<Array<number>> = [];
    private $currTshapeCount: number = 0; // 当前图形的所有分类
    private $currTshapeIdx: number = 0; // 当前图形的下标
    private $ctrlSpr: egret.Sprite = null; // 被控制的Sripte
    private $ctrlTiles: Array<egret.Shape> = []; // 被控制的shape
    private $currLorR: any = null;// 记录已经按下的左或右，防止冲突
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
            this.initUi();
        }
    
        const preload = (): void => {
            RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, onResourceLoadComplete, this);
            RES.loadGroup('preload');
        }

        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, preload, this);
        RES.loadConfig('resource/default.res.json', 'resource/');
        // 背景资源完毕
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


        // 计算方块区域
        let pgrWdt = wdt - 100;
        let pgrHgt = hgt - 120;
        const horzCount = this.$horzCount;
        let per = this.$per = ~~(pgrWdt / horzCount);
        const vertCount = ~~(pgrHgt / per)
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
        this.$pgr.beginFill(0x0, .3);
        this.$pgr.lineStyle(3, 0xffffff, .8);
        this.$pgr.drawRoundRect(-2, -2, pgrWdt+2, pgrHgt+2, 4);
        this.$pgr.lineStyle(1, 0xffffff, .2);
        this.$pgr.endFill();
        this.$pgr.lineStyle(0);
        for (let d = 0; d < vertCount; d++) {
            for (let i = 0; i < horzCount; i++) {
                egret.startTick(() => {
                    if (i % 5 === 0) {
                        console.log(i * per)
                        this.$pgr.beginFill(0x11ee00, .3);
                        this.$pgr.drawRect(i * per, d * per, per, per);
                        this.$pgr.endFill();
                    }
                    return false;
                }, this);
            }
        }

        // for (let i = 1; i < vertCount; i++) {
        //     this.$pgr.beginFill(0x11ee00, .3);
        //     this.$pgr.moveTo(0, per * i - 1);
        //     this.$pgr.drawRect(0, 0, per, per);
        //     // this.$pgr.moveTo(0, per * i - 1);
        //     // this.$pgr.lineTo(pgrWdt, per * i - 1);
        // }

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
        
        // 随机生成某个快
        const tShapes = this.$tShapes = RES.getRes('preDefine_json');
        const tShape = tShapes[this.$currTshape]; // 此处应然是random
        this.$currTshapeCount = tShape.shape.length;
        this.drawElement(tShape, 0); // 此处idx 也应该是random
    }

    public drawElement(shp, idx) {
        const per = this.$per;
        const {bg, shw, cre} = shp.color;
        this.$currTshapeData = shp.shape[idx];
        // 踢墙
        this.autoKick(this.$currTshapeData);
        // 画tile
        this.$currTshapeData.forEach((e, i) => {
            const tile = this.$ctrlTiles[i];
            const g = tile.$graphics;
            const baseY = this.$baseY;
            tile.x = e[0] * per;
            tile.y = e[1] * per;
            g.clear();
            g.beginFill(bg); // 背景色
            g.drawRect(0, 0, per, per);
            g.beginFill(shw); // 阴影颜色
            const mid = ~~(per * .5); // 找中点
            g.drawCircle(mid + 2, mid + 2, per * .3); // 画圆心阴影
            g.beginFill(cre); // 圆心颜色
            g.drawCircle(mid, mid, per * .3); // 画圆心
            g.endFill();
        });
    }

    public initUi(): void {
        // 先初始化背景
        const bg:egret.Bitmap = this.$bg = new egret.Bitmap(); 
        const texture = RES.getRes('bg_jpg');
        const wdt = this.$stage.$stageWidth;
        const hgt = this.$stage.$stageHeight;
        bg.width = wdt;
        bg.height = hgt;
        bg.texture = texture;
        bg.fillMode = egret.BitmapFillMode.CLIP; //默认情况是拉伸,现改为原图
        this.addChild(bg);

        // 始化方块区域
        const $playground = this.$playground = new egret.Sprite();
        const $pgr = this.$pgr = this.$playground.$graphics;
        this.addChild($playground);

        // 初始化控制块 
        const spr = this.$ctrlSpr = new egret.Sprite();
        this.$playground.addChild(spr);

        // 初始化控制的tile
        for (let i = 0; i < 4; i++) {
            const tile = new egret.Shape();
            this.$ctrlTiles.push(tile);
            this.$ctrlSpr.addChild(tile);
        }

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

    /**
     * @param {boolean=} left 是否为左边界
     * @return {boolean} 是否为边界
    */
    public isBorder(left): boolean {
        if (left === undefined) throw new Error('必须指定是否检测左边界！')
        const tType = this.$currTshape;
        const idx = this.$currTshapeIdx;
        const baseY = this.$baseY;
        const tile0X = this.$currTshapeData[0][0]; // 这是第1个片的x轴坐标
        const tile1X = this.$currTshapeData[1][0]; // 这是第2个片的x轴坐标
        const range = [tile0X, tile1X]; // range是宽度范围,要深拷贝
        this.$currTshapeData.forEach(e => {
            const x = e[0];
            x < range[0] && (range[0] = x);
            x > range[1] && (range[1] = x);
        });
        if (left && range[0] + baseY <= 0) return true;
        if (!left && range[1] + baseY + 1 >= this.$horzCount) return true;
        return false;
    }

    /**
     * 向左移一位
     * 1. sprite向左移一位
     * 2. this.$baseY向左移一位，后面记得update就可以了
     * @inner
    */
    public moveLeft(): void {
        if (this.isBorder(true)) return null;
        this.$baseY--;
        this.$ctrlSpr.x -= this.$per;
        console.log('向左移动了', this.$baseY)
    }

    /**
     * 向右移一位
    */
    public moveRight(): void {
        if (this.isBorder(false)) return null;
        this.$baseY++;
        this.$ctrlSpr.x += this.$per;
        console.log('向右移动了', this.$baseY)
    }

    /**
     * 踢墙
     * @param {Array} tShapeData 当前图形数据
     * @inner
    */
    public autoKick(tShapeData): void {
        const range = [tShapeData[0][0], tShapeData[1][0]]; // 第一个片和第二个片的坐标
        tShapeData.forEach(e => {
            const x = e[0];
            x < range[0] && (range[0] = x);
            x > range[1] && (range[1] = x);
        });
        let tileCount = range[1] - range[0] +　1; // 加一是因为俩x坐标的差最小是1，那么至少占1格，比如长条
        this.$ctrlSpr.width = this.$per * tileCount;
        this.$ctrlSpr.height = this.$per * tileCount;
        this.$ctrlSpr.x < 0 && this.moveRight(); // 如果sprite < 0 向右移一位
        const maxWdt = this.$per * this.$horzCount;
        console.log('autoKick:', (this.$baseY + tileCount) * this.$per, maxWdt);
        while((this.$baseY + tileCount) * this.$per > maxWdt) { // 如果sprite + baseY
            this.moveLeft();
        }
    }

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
        (hash === 37 || hash === 39) && this.$currLorR !== hash && this.$ctrlBtns[this.$currLorR] && this.$ctrlBtns[this.$currLorR].start && this.stopRepeatProc(this.$currLorR);
        // this.$keyMap[hash].proc = this.repeatProc.bind(this, proc);
        // egret.startTick(this.$keyMap[hash], this);
        proc.call(this);
        this.tms = Date.now();
        this.$ctrlBtns[hash].tap = egret.setTimeout(() => {
            if (this.$ctrlBtns[hash].tap) {
                this.$ctrlBtns[hash].proc = proc.bind(this);// this.repeatProc.bind(this, proc);
                // egret.startTick(this.$ctrlBtns[hash].proc, this);
                // this.$ctrlBtns[hash].start = true;
                 this.$ctrlBtns[hash].start = egret.setInterval(() => this.$ctrlBtns[hash].start && proc.call(this), this, 20);
                 (hash === 37 || hash === 39) && (this.$currLorR = hash);
            }
        }, this, 80);
        
    }

    /**
     * 停止长按点击
    */
    public stopRepeatProc(hash: number): void {
        this.createText.call(this, Date.now() - this.tms)
        egret.clearTimeout(this.$ctrlBtns[hash].tap);
        this.$ctrlBtns[hash].tap = null;
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
                const idx = ++this.$currTshapeIdx % this.$currTshapeCount;
                this.drawElement(this.$tShapes[this.$currTshape], idx); 
                break;
            case 32:  // space
                const s = Object.keys(this.$tShapes)[this.i++];
                this.$currTshape = s;
                this.$currTshapeIdx = 0;
                this.$currTshapeCount = this.$tShapes[this.$currTshape].shape.length;
                break;
            case 37: // left
                this.startRepeatProc(keyCode, this.moveLeft);
                break;
            case 39: // right
                this.startRepeatProc(keyCode, this.moveRight);
                break;
            case 40: // down
                this.startRepeatProc(keyCode, this.createText);
            default: 
                break;
        }
    }

    // keyup
    public keyUpHandler(keyCode: number): void {
        this.stopRepeatProc(keyCode);
    }
}