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
        this._turn = (mathHelper.random() % 2 === 0) ? Game.Marker.X : Game.Marker.O;
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
        if (player.id === this._playerX.id && this._turn === Game.Marker.X) {
            return true;
        }

        if (player.id === this._playerO.id && this._turn === Game.Marker.O) {
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
            throw Error('Bad move, invalid square!');
        }

        let player = this.getPlayerById(playerId);

        if (!player) {
            throw Error("Chill out, you're not in this game!");
        }

        if (!this.isPlayerTurn(player)) {
            throw Error("Chill out, it's not your turn yet!");
        }

        let cellIndex = cell - 1;

        if (this._board[cellIndex] !== '') {
            throw Error('Too late, square already marked!');
        }

        if (player.id === this._playerX.id) {
            this._board[cellIndex] = Game.Marker.X;
            this._turn = Game.Marker.O;
        } else {
            this._board[cellIndex] = Game.Marker.O;
            this._turn = Game.Marker.X;
        }
    }
}

Game.Status = {
    INPROGRESS: 'INPROGRESS',
    OVER: 'OVER'
};

Game.Marker = {
    X: 'X',
    O: 'O'
};

module.exports = Game;
