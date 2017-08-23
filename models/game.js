const Player = require('./player');

/**
 * This class represents a game.
 */
class Game {
    /**
     * Create a new game.
     * @param  {string} id
     * @param  {Game.Piece} firstTurn
     * @param  {Game.Status} status
     * @param  {Player} playerX
     * @param  {Player} playerO
     * @throws {Error}
     */
    constructor({playerX, playerO, firstTurn, id = String(Date.now()), status = Game.Status.InProgress}) {
        if (!(typeof id === 'string')) {
            throw Error('Invalid argument id');
        }

        if (!(playerX instanceof Player)) {
            throw Error('Invalid argument playerX');
        }

        if (!(playerO instanceof Player)) {
            throw Error('Invalid argument playerO');
        }

        if (!(firstTurn === Game.Piece.X || firstTurn === Game.Piece.O)) {
            throw Error('Invalid argument firstTurn');
        }

        this._id = id;
        this._turn = firstTurn;
        this._playerX = playerX;
        this._playerO = playerO;
        this.status = status;
        this._board = [];

        for (let i = 1; i < 10; i++) {
            this._board.push(Game.Piece.Empty);
        }
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
     * @return {Game.Status}
     */
    get status() {
        return this._status;
    }

    /**
     * Set status.
     * @param  {Game.Status} status
     * @throws {Error}
     */
    set status(status) {
        if (!(Game.Status[status])) {
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
     * @return {Game.Piece}
     */
    get turn() {
        return this._turn;
    }

    /**
     * Check if game is over.
     * @return {boolean}
     */
    isOver() {
        return (this._status !== Game.Status.InProgress);
    }

    /**
     * Check if it's a given player's turn or not.
     * @param  {Player} player
     * @return {boolean}
     * @throws {Error}
     */
    isPlayerTurn(player) {
        if (!(player instanceof Player)) {
            throw Error('Invalid argument player');
        }

        if (player.id === this._playerX.id && this._turn === Game.Piece.X) {
            return true;
        }

        if (player.id === this._playerO.id && this._turn === Game.Piece.O) {
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
     * @param  {number} cellNumber
     * @return {string}
     * @throws {Error}
     */
    makeMove(playerId, cellNumber) {
        if (this.isOver()) {
            throw Error('Sorry, bud. Game over!');
        }

        cellNumber = Number(cellNumber);

        if (!(cellNumber >= 1 && cellNumber <= 9)) {
            throw Error('Sorry, bud. Invalid move!');
        }

        const player = this.getPlayerById(playerId);

        if (!player) {
            // Player not in game
            throw Error('Hahaha! I see what you did there!');
        }

        if (!this.isPlayerTurn(player)) {
            throw Error('Not so fast, bud!');
        }

        const cellIndex = (cellNumber - 1);

        if (this._board[cellIndex] !== Game.Piece.Empty) {
            throw Error('Ooh, you almost had it. Gotta be quicker than that!');
        }

        if (player.id === this._playerX.id) {
            this._board[cellIndex] = Game.Piece.X;
            this._turn = Game.Piece.O;
        } else {
            this._board[cellIndex] = Game.Piece.O;
            this._turn = Game.Piece.X;
        }

        this._checkStatus();
    }

    _checkStatus() {
        // First row wins
        if (this._board[0] != Game.Piece.Empty
            && this._board[0] == this._board[1]
            && this._board[1] == this._board[2]
        ) {
            this._status = Game.Status[this._board[0]];
        }
        // Second row wins
        else if (this._board[3] != Game.Piece.Empty
            && this._board[3] == this._board[4]
            && this._board[4] == this._board[5]
        ) {
            this._status = Game.Status[this._board[3]];
        }
        // Third row wins
        else if (this._board[6] != Game.Piece.Empty
            && this._board[6] == this._board[7]
            && this._board[7] == this._board[8]
        ) {
            this._status = Game.Status[this._board[6]];
        }
        // First column wins
        else if (this._board[0] != Game.Piece.Empty
            && this._board[0] == this._board[3]
            && this._board[3] == this._board[6]
        ) {
            this._status = Game.Status[this._board[0]];
        }
        // Second column wins
        else if (this._board[1] != Game.Piece.Empty
            && this._board[1] == this._board[4]
            && this._board[4] == this._board[7]
        ) {
            this._status = Game.Status[this._board[1]];
        }
        // Third column wins
        else if (this._board[2] != Game.Piece.Empty
            && this._board[2] == this._board[5]
            && this._board[5] == this._board[8]
        ) {
            this._status = Game.Status[this._board[2]];
        }
        // Across right wins
        else if (this._board[0] != Game.Piece.Empty
            && this._board[0] == this._board[4]
            && this._board[4] == this._board[8]
        ) {
            this._status = Game.Status[this._board[0]];
        }
        // Across left wins
        else if (this._board[2] != Game.Piece.Empty
            && this._board[2] == this._board[4]
            && this._board[4] == this._board[6]
        ) {
            this._status = Game.Status[this._board[2]];
        }
        // Draw
        else if (this._board[0] != Game.Piece.Empty
            && this._board[1] != Game.Piece.Empty
            && this._board[2] != Game.Piece.Empty
            && this._board[3] != Game.Piece.Empty
            && this._board[4] != Game.Piece.Empty
            && this._board[5] != Game.Piece.Empty
            && this._board[6] != Game.Piece.Empty
            && this._board[7] != Game.Piece.Empty
            && this._board[8] != Game.Piece.Empty
        ) {
            this._status = Game.Status.Draw;
        }
    }
}

Game.Piece = {
    X: 'X',
    O: 'O',
    Empty: ''
};

Game.Status = {
    InProgress: 'InProgress',
    Draw: 'Draw',
    X: Game.Piece.X, // X Wins
    O: Game.Piece.O  // O Wins
};

module.exports = Game;
