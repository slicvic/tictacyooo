const Player     = require('../models/player');
const Game       = require('../models/game');
const mathHelper = require('../helpers/math');

/**
 * Maintains state of games and players.
 */
class StateManager {
    /**
     * Create a new instance.
     */
    constructor() {
        this.players = {};
        this.games = {};
    }

    /**
     * Get number of games.
     * @return {number}
     */
    countGames() {
        return Object.keys(this.games).length;
    }

    /**
     * Get number of players logged in to the app.
     * @return {number}
     */
    countPlayers() {
        return Object.keys(this.players).length;
    }

    /**
     * Check if a game exists.
     * @param  {string} gameId
     * @return {boolean}
     */
    gameExists(gameId) {
        return (this.games[gameId] instanceof Game);
    }

    /**
     * Check if a player exists.
     * @param  {string} playerId
     * @return {boolean}
     */
    playerExists(playerId) {
        return (this.players[playerId] instanceof Player);
    }

    /**
     * Find an opponent for a given player.
     * @param {Player} playerX
     */
    findOpponent(playerX) {
        if (!(playerX instanceof Player)) {
    		throw 'Invalid argument playerX';
    	}

    	for (let playerId in this.players) {
    		if (playerId === playerX.id || this.players[playerId].status !== Player.Status.AwaitingOpponent) {
    			continue;
    		}

    		const playerO = this.players[playerId];
            const firstTurn = (mathHelper.random() % 2 === 0) ? Game.Piece.X : Game.Piece.O;
    		const game = new Game({playerX: playerX, playerO: playerO, firstTurn: firstTurn});

            playerX.status = Player.Status.Playing;
    		playerO.status = Player.Status.Playing;

    		playerX.socket.emit('game.start', {
    			gameId: game.id,
                user: {
                    firstTurn: (game.turn === Game.Piece.X),
                    piece: Game.Piece.X
                },
                opponent: {
                    id: game.playerO.id,
                    name: game.playerO.name,
                    piece: Game.Piece.O
                }
    		});

    		playerO.socket.emit('game.start', {
    			gameId: game.id,
                user: {
                    firstTurn: (game.turn === Game.Piece.O),
    				piece: Game.Piece.O
    			},
    			opponent: {
    				id: playerX.id,
    				name: playerX.name,
                    piece: Game.Piece.X
    			}
    		});

            this.games[game.id] = game;

    		break;
    	}
    }
}

let instance = null;

function getInstance() {
    if (!instance) {
        instance = new StateManager;
    }

    return instance;
}

module.exports = getInstance;
