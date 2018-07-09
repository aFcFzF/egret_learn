var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var TetStrategy = (function () {
    function TetStrategy(main) {
        this.main = null;
        this.tetScore = {
            score: 0,
            panel: null,
            fontScore: null,
            scoreMaxWdt: 110,
            scoreMaxHgt: 30,
            cleanUpText: null
        };
        this.tetProgress = {
            level: 0,
            progressBar: null,
            maxProgress: 100,
            progressShp: null,
            progressText: null,
            progress: 0,
            count: 0
        };
        this.sound = {
            clean1: null,
            clean2: null,
            clean3: null,
            clean4: null,
        };
        this.pause = {
            pauseBmp: null,
            pause: false,
        };
        this.timer = {
            interval: 800
        };
        this.init(main);
    }
    TetStrategy.prototype.init = function (main) {
        var _a = this, tetScore = _a.tetScore, tetProgress = _a.tetProgress, pause = _a.pause, sound = _a.sound;
        this.main = main;
        var panel = tetScore.panel = new egret.Sprite();
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
        var scoreBox = new egret.Sprite();
        var scoreTextArea = new egret.Sprite();
        var _b = [tetScore.scoreMaxWdt, tetScore.scoreMaxHgt], scoreBoxWdt = _b[0], scoreBoxHgt = _b[1];
        Object.assign(scoreBox, {
            name: 'scoreBox',
            x: 10,
            y: 20,
            height: scoreBoxHgt,
            width: scoreBoxWdt
        });
        var cleanText = tetScore.cleanUpText = new egret.BitmapText();
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
        var sg = scoreBox.$graphics;
        sg.beginFill(0x5F5487, .9);
        sg.drawRoundRect(15, 0, scoreBoxWdt, scoreBoxHgt, 8);
        sg.endFill();
        // 加分数icon
        var scoreIcon = new egret.Bitmap(RES.getRes('score_png'));
        Object.assign(scoreIcon, {
            x: -10,
            y: -5,
            width: 40,
            height: 40
        });
        var scoreText = tetScore.fontScore = new egret.BitmapText();
        // 计算文字高度
        var defaultTextHgt = 64;
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
        var progressBar = tetProgress.progressBar = new egret.Sprite();
        Object.assign(progressBar, {
            name: 'progressBar',
            x: 160,
            y: 20,
            width: tetProgress.maxProgress,
            height: 30
        });
        var prog = progressBar.$graphics;
        prog.beginFill(0x5F5487, .9);
        prog.drawRoundRect(0, 0, tetProgress.maxProgress, 30, 8);
        prog.endFill();
        panel.addChild(progressBar);
        var progIcon = new egret.Bitmap(RES.getRes('level_png'));
        Object.assign(progIcon, {
            name: 'progIcon',
            x: -15,
            y: -5,
            width: 40,
            height: 40
        });
        var progText = tetProgress.progressText = new egret.BitmapText();
        Object.assign(progText, {
            font: main.$gmFont,
            scaleX: .2,
            scaleY: .3,
            text: '00',
            x: -8,
            y: 5
        });
        var proShp = tetProgress.progressShp = new egret.Shape();
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
        var txrPause = RES.getRes('pause_png');
        var txtResume = RES.getRes('resume_png');
        var pauseBtn = pause.pauseBmp = new egret.Bitmap(RES.getRes('pause_png'));
        Object.assign(pauseBtn, {
            x: main.stage.width - 34,
            y: 34,
            width: 48,
            height: 48,
            anchorOffsetX: 24,
            anchorOffsetY: 24,
            touchEnabled: true
        });
        pauseBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
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
    };
    TetStrategy.prototype.start = function () {
        var _a = this, main = _a.main, timer = _a.timer;
        var control = RES.getRes('gameBG_mp3').play(0, 1);
        control.volume = .3;
        var item = main.$previewBox.tetQueue.dequeue();
        console.log('初始化方块', item);
        main.$tetromino.tetTiles.forEach(function (e) { return e.width = e.height = main.$per; });
        main.drawTetromino(item[0], item[1]);
        egret.setInterval(main.down, main, timer.interval);
    };
    /**
     * 调整字体
    */
    TetStrategy.prototype.justifyFont = function () {
        var tetScore = this.tetScore;
        var _a = [tetScore.scoreMaxWdt, tetScore.scoreMaxHgt], maxWdt = _a[0], maxHgt = _a[1];
        var _b = [tetScore.fontScore.width, tetScore.fontScore.height], realWdt = _b[0], realHgt = _b[1];
        var scaleX = realWdt - maxWdt > 20 ? +((maxWdt - 20) / realWdt).toFixed(2) : 1;
        var scaleY = realHgt - maxHgt > 10 ? +((maxHgt - 10) / realHgt).toFixed(2) : 1;
        var scale = Math.min(scaleX, scaleY);
        tetScore.fontScore.scaleX = tetScore.fontScore.scaleY = scale;
        tetScore.fontScore.x = ~~((maxWdt - 20) / 2) - ~~(realWdt * scale / 2);
        tetScore.fontScore.y = ~~(maxHgt / 2) - ~~(realHgt * scale / 2);
    };
    /**
     * 加分
     * @param {number} lines 消除的行数加分
    */
    TetStrategy.prototype.addScore = function (lines) {
        var _a = this, tetScore = _a.tetScore, sound = _a.sound;
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
    };
    TetStrategy.prototype.updateScore = function () {
        var tetScore = this.tetScore;
        tetScore.fontScore.text = tetScore.score.toString();
        this.justifyFont();
    };
    TetStrategy.prototype.addProgress = function (lines) {
        var _a = this, tetProgress = _a.tetProgress, tetScore = _a.tetScore;
        var ratio = ~~(tetProgress.maxProgress / 25);
        var g = tetProgress.progressShp.$graphics;
        tetProgress.count += lines;
        tetScore.cleanUpText.text = tetProgress.count > 9 ? tetProgress.count + '' : '0' + tetProgress.count;
        if (!(tetProgress.count % 25)) {
            var newLevel = ++tetProgress.level;
            var newLevelStr = newLevel > 9 ? newLevel + '' : '0' + newLevel;
            tetProgress.progressText.text = newLevelStr;
            g.clear();
        }
        var progress = tetProgress.count % 25 * ratio;
        var aniProgress = function () {
            var i = tetProgress.progress;
            tetProgress.progress = progress;
            g.beginFill(0xF7C11D);
            var aniProc = function () {
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
    };
    return TetStrategy;
}());
__reflect(TetStrategy.prototype, "TetStrategy");
//# sourceMappingURL=Strategy.js.map