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
        if (!(typeof status === 'string' && Game.isValidStatus(status))) {
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

    static create(playerX, playerO, status = null, id = null) {
        status = (null === status) ? Game.Status.INPROGRESS : status;
        id = (null === id) ? btoa(Date.now()) : id;
        return new Game(id, status, playerX, playerO);
    }

    static isValidStatus(status) {
        for (let key in Game.Status) {
            if (status === Game.Status[key]) {
                return true;
            }
        }
        return false;
    }
}

Game.Status = {
    INPROGRESS: 'inprogress',
    OVER: 'over'
};

Game.Symbol = {
    X: 'X',
    O: 'O'
};

module.exports = Game;
