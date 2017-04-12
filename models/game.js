const Player = require('./player');

class Game {
    constructor(id, status, playerX, playerO) {
        this.setId(id);
        this.setStatus(status);
        this.setPlayerX(playerX);
        this.setPlayerO(playerO);
    }

    getId() {
        return this.id;
    }

    setId(id) {
        if (typeof id !== 'string') {
            throw 'Invalid argument id';
        }
        this.id = id;
        return this;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status) {
        if (!(typeof status === 'string' && Game.isStatusValid(status))) {
            throw 'Invalid argument status';
        }
        this.status = status;
        return this;
    }

    getPlayerX() {
        return this.playerX;
    }

    setPlayerX(playerX) {
        if (!(playerX instanceof Player)) {
            throw 'Invalid argument playerX';
        }
        this.playerX = playerX;
        return this;
    }

    getPlayerO() {
        return this.playerO;
    }

    setPlayerO(playerO) {
        if (!(playerO instanceof Player)) {
            throw 'Invalid argument playerO';
        }
        this.playerO = playerO;
        return this;
    }

    static isStatusValid(status) {
        for (let key in Game.Status) {
            if (status === Game.Status[key]) {
                return true;
            }
        }
        return false;
    }
}

Game.Status = {
    INPROGRESS: 'inProgress',
    OVER: 'over'
};

Game.Symbol = {
    X: 'X',
    O: 'O'
};

module.exports = Game;
