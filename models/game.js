const Player     = require('./player');
const mathHelper = require('../helpers/math');

/**
 * A game object.
 */
class Game {
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
        this._turn = (mathHelper.random() % 2 === 0) ? Game.Chip.X : Game.Chip.O;
        this._board = ['', '', '', '', '', '', '', '', ''];
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
        if (!Game.Status[status]) {
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
        if (player.id === this._playerX.id && this._turn === Game.Chip.X) {
            return true;
        }

        if (player.id === this._playerO.id && this._turn === Game.Chip.O) {
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
        cell = Number(cell);

        if (!(cell >= 1 && cell <= 9)) {
            throw Error("That's not a valid cell");
        }

        let player = this.getPlayerById(playerId);

        if (!player) {
            throw Error("You're not in the game");
        }

        if (!this.isPlayerTurn(player)) {
            throw Error("It's not your turn");
        }

        let cellIndex = cell - 1;

        if (this._board[cellIndex] !== '') {
            throw Error('That move was already made');
        }

        if (player.id === this._playerX.id) {
            this._board[cellIndex] = Game.Chip.X;
            this._turn = Game.Chip.O;
        } else {
            this._board[cellIndex] = Game.Chip.O;
            this._turn = Game.Chip.X;
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
