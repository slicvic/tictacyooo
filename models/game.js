const Player = require('./player');
const math   = require('../helpers/math');

/**
 * A game object.
 */
class Game {
    /**
     * Check if a given cell is valid or not.
     * @param  {number} cell
     * @return {boolean}
     */
    static isValidCell(cell) {
        cell = Number(cell);
        return (cell >= 0 && cell <= 8);
    }

    /**
     * Create a new game.
     * @param  {Player} playerX
     * @param  {Player} playerO
     * @throws {Error}
     */
    constructor(playerX, playerO) {
        if (!(playerX instanceof Player)) {
            throw Error('Invalid argument playerX');
        }

        if (!(playerO instanceof Player)) {
            throw Error('Invalid argument playerO');
        }

        this._id = String(Date.now());
        this._turn = (math.random() % 2 === 0) ? Game.Symbol.X : Game.Symbol.O;
        this._grid = ['', '', '', '', '', '', '', '', ''];
        this._playerX = playerX;
        this._playerO = playerO;
        this.status = Game.Status.INPROGRESS;
    }

    /**
     * Get id.
     * @return {string}
     */
    get id() {
        return this._id;
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
     * @param  {string} status
     * @throws {Error}
     */
    set status(status) {
        if (!(typeof status === 'string' && Game.Status[status])) {
            throw Error('Invalid argument status');
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
     * Get playerO.
     * @return {Player}
     */
    get playerO() {
        return this._playerO;
    }

    /**
     * Get turn.
     * @return {string}
     */
    get turn() {
        return this._turn;
    }

    /**
     * Check if it's a given player's turn or not.
     * @param  {Player} player
     * @return {boolean}
     */
    isPlayerTurn(player) {
        if (player.id === this._playerX.id && this._turn === Game.Symbol.X) {
            return true;
        }

        if (player.id === this._playerO.id && this._turn === Game.Symbol.O) {
            return true;
        }

        return false;
    }

    /**
     * Get player by id.
     * @param  {string} playerId
     * @return {Player|null}
     */
    getPlayerById(playerId) {
        playerId = String(playerId);

        if (playerId === this._playerX.id) {
            return this._playerX;
        }

        if (playerId === this._playerO.id) {
            return this._playerO;
        }

        return null;
    }

    /**
     * Make a move.
     * @param  {string} playerId
     * @param  {number} cell
     * @throws {Error}
     */
    makeMove(playerId, cell) {
        const player = this.getPlayerById(playerId);

        if (!player) {
            throw Error("You're not in the game");
        }

        if (!this.isPlayerTurn(player)) {
            throw Error("It's not your turn");
        }

        if (!Game.isValidCell(cell)) {
            throw Error("That's not a valid cell");
        }

        if (this._grid[cell] !== '') {
            throw Error('That move was already made');
        }

        if (player.id === this._playerX.id) {
            this._grid[cell] = Game.Symbol.X;
            this._turn = Game.Symbol.O;
        } else {
            this._grid[cell] = Game.Symbol.O;
            this._turn = Game.Symbol.X;
        }
    }
}

Game.Status = {
    INPROGRESS: 'INPROGRESS',
    OVER: 'OVER'
};

Game.Chip = {
    X: 'X',
    O: 'O'
};

module.exports = Game;
