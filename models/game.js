const Player     = require('./player');

/**
 * A game object.
 */
class Game {
    /**
     * Create a new game.
     * @param  {string|number} id
     * @param  {Game.Marker} firstTurn
     * @param  {Game.Status} status
     * @param  {Player} playerX
     * @param  {Player} playerO
     * @throws {Error}
     */
    constructor({playerX, playerO, firstTurn, id = String(Date.now()), status = Game.Status.InProgress}) {
        if (!(playerX instanceof Player)) {
            throw Error('Invalid argument playerX');
        }

        if (!(playerO instanceof Player)) {
            throw Error('Invalid argument playerO');
        }

        if (!(firstTurn === Game.Marker.X || firstTurn === Game.Marker.O)) {
            throw Error('Invalid argument firstTurn');
        }

        this._id = id;
        this._turn = firstTurn;
        this._playerX = playerX;
        this._playerO = playerO;
        this._board = ['', '', '', '', '', '', '', '', ''];
        this.status = status;
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
     * @return {Player|false}
     */
    findPlayerById(playerId) {
        if (playerId === this._playerX.id) {
            return this._playerX;
        }

        if (playerId === this._playerO.id) {
            return this._playerO;
        }

        return false;
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

        const player = this.findPlayerById(playerId);

        if (!player) {
            throw Error("Chill out yo, you're not in this game!");
        }

        if (!this.isPlayerTurn(player)) {
            throw Error("Chill out yo, it's not your turn yet!");
        }

        const index = (position - 1);

        if (this._board[index] !== Game.Marker.Empty) {
            throw Error('Too late yo, square already marked!');
        }

        if (player.id === this._playerX.id) {
            this._board[index] = Game.Marker.X;
            this._turn = Game.Marker.O;
        } else {
            this._board[index] = Game.Marker.O;
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
