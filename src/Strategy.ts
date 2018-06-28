interface config {
    
}


interface TetScore {
    level: number;
    score: number;
    lines: number;
}

interface TetLevel {

}

class TetStrategy {
    private tetScore: TetScore = {
        level: 1,
        score: 0,
        lines: 0
    };
    
    private constructor() {
        this.init();
    }

    private init() {

    }

    private start() {

    }

    /**
     * 加分
     * @param {number} lines 消除的行数加分
    */
    private addScore(lines: number) {
        const {tetScore} = this;
        const map = [10, 30, 50, 80];
        tetScore.score += tetScore.level * map[lines];
        tetScore.lines += lines;
        if (tetScore.lines % 20 === 0) {
            tetScore.level++;
            this.levelUp();
        }
    }

    private levelUp() {
        
    }

}

