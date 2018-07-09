
interface Sound {
    clean1: egret.Sound;
    clean2: egret.Sound;
    clean3: egret.Sound;
    clean4: egret.Sound;
}

interface TetScore {
    score: number;
    panel: egret.Sprite;
    fontScore: egret.BitmapText;
    scoreMaxWdt: number;
    scoreMaxHgt: number;
    cleanUpText: egret.BitmapText;
}

interface TetProgress {
        // 进度
    level: number;
    progressBar: egret.Sprite;
    maxProgress: number;
    progress: number;
    progressShp: egret.Shape;
    progressText: egret.BitmapText;
    count: number;
}

interface Pause {
    pauseBmp: egret.Bitmap;
    pause: boolean;
}

interface Timer {
    interval: number;
}

class TetStrategy {
    private main = null;

    private tetScore: TetScore = {
        score: 0,
        panel: null,
        fontScore: null,
        scoreMaxWdt: 110,
        scoreMaxHgt: 30,
        cleanUpText: null
    };

    private tetProgress: TetProgress = {
        level: 0,
        progressBar: null,
        maxProgress: 100,
        progressShp: null,
        progressText: null,
        progress: 0,
        count: 0
    }

    private sound: Sound = {
        clean1: null,
        clean2: null,
        clean3: null,
        clean4: null,
    }

    private pause: Pause = {
        pauseBmp: null,
        pause: false,
    }

    private timer: Timer = {
        interval: 800
    }

    public constructor(main: Main) {
        this.init(main);
    }

    public init(main: Main) {
        const {tetScore, tetProgress, pause, sound} = this;
        this.main = main;
        const panel = tetScore.panel = new egret.Sprite();
        panel.name = "strategyPanel";
        // 先画penel
        Object.assign(panel, {
            x: 0,
            y: 0,
            height: 70,
            width: main.$stage.width
        });
        main.addChild(panel);
        
        // 画分数部分
        const scoreBox = new egret.Sprite();
        const scoreTextArea = new egret.Sprite();
        const [scoreBoxWdt, scoreBoxHgt] = [tetScore.scoreMaxWdt, tetScore.scoreMaxHgt];
        Object.assign(scoreBox, {
            name: 'scoreBox',
            x: 10, 
            y: 20,
            height: scoreBoxHgt,
            width: scoreBoxWdt
        });

        const cleanText = tetScore.cleanUpText = new egret.BitmapText();
        Object.assign(cleanText, {
            font: main.$gmFont,
            scaleX: .2,
            scaleY: .3,
            text: '00',
            x: -3,
            y: 5
        });


        Object.assign(scoreTextArea, {
            name: 'scoreTextArea',
            x: 30,
            y: 0,
            width: scoreBoxWdt - 15,
            height: scoreBoxHgt
        });

        scoreBox.addChild(scoreTextArea);
        const sg = scoreBox.$graphics;
        sg.beginFill(0x5F5487, .9);
        sg.drawRoundRect(15, 0, scoreBoxWdt, scoreBoxHgt, 8);
        sg.endFill();

        // 加分数icon
        const scoreIcon = new egret.Bitmap(RES.getRes('score_png'));
        Object.assign(scoreIcon, {
            x: -10, 
            y: -5,
            width: 40,
            height: 40
        });

        const scoreText = tetScore.fontScore = new egret.BitmapText();
        // 计算文字高度
        const defaultTextHgt = 64;

        Object.assign(scoreText, {
            font: main.$gmFont,
            x: 10,
            y: 5,
            scaleX: .3,
            scaleY: .3,
            text: '0'
        });

        scoreBox.addChild(scoreIcon);
        scoreTextArea.addChild(scoreText);
        scoreBox.addChild(cleanText);

        panel.addChild(scoreBox);

        this.justifyFont();

        // 画进度部分
        const progressBar = tetProgress.progressBar = new egret.Sprite();
        Object.assign(progressBar, {
            name: 'progressBar',
            x: 160,
            y: 20,
            width: tetProgress.maxProgress,
            height: 30
        });

        const prog = progressBar.$graphics;
        prog.beginFill(0x5F5487, .9);
        prog.drawRoundRect(0, 0, tetProgress.maxProgress, 30, 8);
        prog.endFill();

        panel.addChild(progressBar);

        const progIcon = new egret.Bitmap(RES.getRes('level_png'));
        Object.assign(progIcon, {
            name: 'progIcon',
            x: -15,
            y: -5,
            width: 40,
            height: 40
        });

        const progText = tetProgress.progressText = new egret.BitmapText();
        Object.assign(progText, {
            font: main.$gmFont,
            scaleX: .2,
            scaleY: .3,
            text: '00',
            x: -8,
            y: 5
        })

        const proShp = tetProgress.progressShp = new egret.Shape();
        Object.assign(proShp, {
            x: 0,
            y: 0,
            height: 30,
            width: 0
        });
        progressBar.addChild(proShp);

        progressBar.addChild(progIcon);

        progressBar.addChild(progText);

        // 初始化暂停
        const txrPause = RES.getRes('pause_png');
        const txtResume = RES.getRes('resume_png');
        const pauseBtn = pause.pauseBmp =  new egret.Bitmap(RES.getRes('pause_png'));
        Object.assign(pauseBtn, {
            x: main.stage.width - 34,
            y: 34,
            width: 48,
            height: 48,
            anchorOffsetX: 24,
            anchorOffsetY: 24,
            touchEnabled: true 
        });

        pauseBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            pause.pause = !pause.pause;
            pause.pause ? pauseBtn.texture = txtResume : pauseBtn.texture = txrPause;
            egret.Tween.get(pauseBtn).to({
                scaleX: .8,
                scaleY: .8
            }, 100)
            .to({
                scaleX: 1,
                scaleY: 1
            });
        }, this);

        panel.addChild(pauseBtn);


        // 初始化音频
        Object.assign(sound, {
            clean1: RES.getRes('delete1_mp3'),
            clean2: RES.getRes('delete2_mp3'),
            clean3: RES.getRes('delete3_mp3'),
            clean4: RES.getRes('delete4_mp3')
        });
    }

    start() {
        const {main, timer} = this;
        const control = RES.getRes('gameBG_mp3').play(0, 1);
        control.volume = .3;

        const item = main.$previewBox.tetQueue.dequeue();
        console.log('初始化方块', item);
        main.$tetromino.tetTiles.forEach(e => e.width = e.height = main.$per);
        main.drawTetromino(item[0], item[1]);

        
        egret.setInterval(main.down, main, timer.interval);
    }

    /**
     * 调整字体
    */
    private justifyFont() {
        const {tetScore} = this;
        const [maxWdt, maxHgt] = [tetScore.scoreMaxWdt, tetScore.scoreMaxHgt];
        const [realWdt, realHgt] = [tetScore.fontScore.width, tetScore.fontScore.height];
        const scaleX = realWdt - maxWdt  > 20 ? +((maxWdt - 20) / realWdt).toFixed(2) : 1;
        const scaleY = realHgt - maxHgt  > 10 ? +((maxHgt - 10) / realHgt).toFixed(2) : 1;
        const scale = Math.min(scaleX, scaleY);
        tetScore.fontScore.scaleX = tetScore.fontScore.scaleY = scale;
        tetScore.fontScore.x = ~~((maxWdt - 20) / 2 ) - ~~(realWdt * scale / 2);
        tetScore.fontScore.y = ~~(maxHgt / 2 ) - ~~(realHgt * scale / 2);
    }

    /**
     * 加分
     * @param {number} lines 消除的行数加分
    */
    addScore(lines: number) {
        const {tetScore, sound} = this;
        switch (lines) {
            case 1: 
                tetScore.score += 10;
                sound.clean1.play(0, 1);
                break;
            case 2:
                tetScore.score += 30;
                sound.clean2.play(0, 1);
                break;
            case 3: 
                tetScore.score += 50;
                sound.clean3.play(0, 1);
                break;
            case 4:
                tetScore.score += 80;
                sound.clean4.play(0, 1);
                break;
            default:
                break;
        }
        this.addProgress(lines);
        this.updateScore();
    }

    updateScore() {
        const {tetScore} = this;
        tetScore.fontScore.text = tetScore.score.toString();
        this.justifyFont()
    }

    addProgress(lines: number) {
        const {tetProgress, tetScore} = this;
        const ratio = ~~(tetProgress.maxProgress / 25);
        const g = tetProgress.progressShp.$graphics;
        tetProgress.count += lines;
        tetScore.cleanUpText.text = tetProgress.count > 9 ? tetProgress.count + '' : '0' + tetProgress.count ;
        if (!(tetProgress.count % 25)) {
            const newLevel = ++tetProgress.level;
            const newLevelStr = newLevel > 9 ? newLevel + '' : '0' + newLevel;
            tetProgress.progressText.text = newLevelStr;
            g.clear();
        }
        const progress = tetProgress.count % 25 * ratio;
        const aniProgress = () => {
            let i =  tetProgress.progress;
            tetProgress.progress = progress;
            g.beginFill(0xF7C11D);
            const aniProc = () => {
                if (i++ >= progress) {
                    g.endFill();
                    return egret.stopTick(aniProc, null);
                }
                g.drawRoundRect(0, 0, i, 30, 8);
                return true;
            };
            egret.startTick(aniProc, null);
        };

        aniProgress();

    }

}

