const Player = require('./player');

class Game {
    constructor(id, status, playerX, playerO) {
        this.id = id;
        this.status = status;
        this.playerX = playerX;
        this.playerO = playerO;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = String(id);
    }

    get status() {
        return this._status;
    }

    set status(status) {
        if (!Game.isStatusValid(status)) {
            throw 'Invalid argument status';
        }
        this._status = status;
    }

    get playerX() {
        return this._playerX;
    }

    set playerX(playerX) {
        if (!(playerX instanceof Player)) {
            throw 'Invalid argument playerX';
        }
        this._playerX = playerX;
    }

    get playerO() {
        return this._playerO;
    }

    set playerO(playerO) {
        if (!(playerO instanceof Player)) {
            throw 'Invalid argument playerO';
        }
        this._playerO = playerO;
    }

    static create(playerX, playerO, status = null, id = null) {
        status = (null === status) ? Game.Status.INPROGRESS : status;
        id = (null === id) ? Date.now().toString() : id;
        return new Game(id, status, playerX, playerO);
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
