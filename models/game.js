const Player = require('./player');
const math   = require('../helpers/math');

/**
 * Represents a game.
 */
class Game {
    /**
     * Create a new game.
     * @param {Player} playerX
     * @param {Player} playerO
     * @param {string} status
     * @param {string} id
     * @param {string} turn
     * @return {Game}
     */
    static create(playerX, playerO, status = null, id = null, turn = null) {
        status = (null === status) ? Game.Status.INPROGRESS : status;
        id = (null === id) ? Date.now().toString() : id;
        if (null === turn) {
            turn = (math.random() % 2 === 0) ? Game.Symbol.X : Game.Symbol.O;
        }

        return new Game(id, status, playerX, playerO, turn);
    }

    /**
     * Check if a given status is valid or not.
     * @param {string} string
     * @return {boolean}
     */
    static isStatusValid(status) {
        for (let key in Game.Status) {
            if (status === Game.Status[key]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create a new game.
     * @param {string} id
     * @param {string} status
     * @param {Player} playerX
     * @param {Player} playerO
     * @param {string} turn
     */
    constructor(id, status, playerX, playerO, turn) {
        this.id = id;
        this.status = status;
        this.playerX = playerX;
        this.playerO = playerO;
        this.turn = turn;
    }

    /**
     * Get id.
     * @return {string}
     */
    get id() {
        return this._id;
    }

    /**
     * Set id.
     * @param {string} id
     */
    set id(id) {
        this._id = String(id);
    }

    /**
     * Get status.
     * @return {string}
     */
    get status() {
        return this._status;
    }

    /**
     * Set status.
     * @param {string} status
     */
    set status(status) {
        if (!Game.isStatusValid(status)) {
            throw 'Invalid argument status';
        }
        this._status = status;
    }

    /**
     * Get playerX.
     * @return {Player}
     */
    get playerX() {
        return this._playerX;
    }

    /**
     * Set playerX.
     * @param {Player} playerX
     */
    set playerX(playerX) {
        if (!(playerX instanceof Player)) {
            throw 'Invalid argument playerX';
        }
        this._playerX = playerX;
    }

    /**
     * Get playerO.
     * @return {Player}
     */
    get playerO() {
        return this._playerO;
    }

    /**
     * Set playerO.
     * @param {Player} playerO
     */
    set playerO(playerO) {
        if (!(playerO instanceof Player)) {
            throw 'Invalid argument playerO';
        }
        this._playerO = playerO;
    }

    /**
     * Get turn.
     * @return {string}
     */
    get turn() {
        return this._turn;
    }

    /**
     * Set turn.
     * @param {string} turn
     */
    set turn(turn) {
        if (!(turn === Game.Symbol.X || turn === Game.Symbol.O)) {
            throw 'Invalid argument turn';
        }
        this._turn = turn;
    }

    /**
     * Check if a player is actually in the game.
     * @param {string} playerId
     * @return {boolean}
     */
    isPlayerInGame(playerId) {
        playerId = String(playerId);
        return (playerId === this._playerX.id || playerId === this._playerO.id);
    }

    /**
     * Check if it's a player's turn.
     * @param {string} playerId
     * @return {boolean}
     */
    isPlayerTurn(playerId) {
        playerId = String(playerId);

        if (playerId === this._playerX.id && this._turn === Game.Symbol.X) {
            return true;
        }

        if (playerId === this._playerO.id && this._turn === Game.Symbol.O) {
            return true;
        }

        return false;
    }

    /**
     * Switch player turns.
     */
    switchTurn() {
        this.turn = (turn.turn === Game.Symbol.X) ? Game.Symbol.O : Game.Symbol.X;
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
