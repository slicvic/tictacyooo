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
        this.status = Game.Status.InProgress;
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
     * @param  {number} position
     * @throws {Error}
     */
    makeMove(playerId, position) {
        position = Number(position);

        if (!(position >= 1 && position <= 9)) {
            throw Error('Bad move yo, square out of bounds!');
        }

        const player = this.getPlayerById(playerId);

        if (!player) {
            throw Error("Chill out yo, you're not in this game!");
        }

        if (!this.isPlayerTurn(player)) {
            throw Error("Chill out yo, it's not your turn yet!");
        }

        const boardIndex = (position - 1);

        if (this._board[boardIndex] !== Game.Marker.Empty) {
            throw Error('Too late yo, square already marked!');
        }

        if (player.id === this._playerX.id) {
            this._board[boardIndex] = Game.Marker.X;
            this._turn = Game.Marker.O;
        } else {
            this._board[boardIndex] = Game.Marker.O;
            this._turn = Game.Marker.X;
        }
    }
}

Game.Status = {
    InProgress: 'InProgress',
    Over: 'Over'
};

Game.Marker = {
    X: 'X',
    O: 'O',
    Empty: ''
};

module.exports = Game;
