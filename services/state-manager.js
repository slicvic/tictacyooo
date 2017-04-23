const Player = require('../models/player');
const Game   = require('../models/game');

/**
 * Maintains games and players state.
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
     */
    countGames() {
        return Object.keys(this.games).length;
    }

    /**
     * Get number of players logged in to the app.
     */
    countPlayers() {
        return Object.keys(this.players).length;
    }

    /**
     * Check if a game exists.
     * @param {string} gameId
     */
    doesGameExist(gameId) {
        gameId = String(gameId);
        return (this.games[gameId] instanceof Game);
    }

    /**
     * Check if a player exists.
     * @param {string} playerId
     */
    doesPlayerExist(playerId) {
        playerId = String(playerId);
        return (this.players[playerId] instanceof Player);
    }

    /**
     * Check if a player is in a given game.
     * @param {string} playerId
     * @param {string} gameId
     */
    isPlayerInGame(playerId, gameId) {
        if (!this.doesGameExist(gameId)) {
            return false;
        }

        return this.games[gameId].isPlayerInGame(playerId);
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
    		if (playerId === playerX.id || this.players[playerId].status !== Player.Status.AWAITING_OPPONENT) {
    			continue;
    		}

    		const playerO = this.players[playerId];
    		const game = Game.create(playerX, playerO);
    		playerX.status = Player.Status.PLAYING;
    		playerO.status = Player.Status.PLAYING;

    		playerX.socket.emit('game.start', {
    			gameId: game.id,
    			turn: game.turn,
    			me: {
    				symbol: Game.Symbol.X
    			},
    			opponent: {
    				symbol: Game.Symbol.O,
    				id: game.playerO.id,
    				name: game.playerO.name
    			}
    		});

    		playerO.socket.emit('game.start', {
    			gameId: game.id,
    			turn: game.turn,
    			me: {
    				symbol: Game.Symbol.O
    			},
    			opponent: {
    				symbol: Game.Symbol.X,
    				id: playerX.id,
    				name: playerX.name
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
