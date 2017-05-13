const Player = require('../models/player');
const Game   = require('../models/game');

/**
 * Maintains state of games and players.
 */
class StateManager {
    /**
     * Create a new instance.
     */
    constructor() {
        this._players = {};
        this._games = {};
    }

    /**
     * Get players.
     * @return {Object}
     */
    get players() {
        return this._players;
    }

    /**
     * Get games.
     * @return {Object}
     */
    get games() {
        return this._games;
    }

    /**
     * Get number of games.
     * @return {number}
     */
    countGames() {
        return Object.keys(this._games).length;
    }

    /**
     * Get number of players logged in to the app.
     * @return {number}
     */
    countPlayers() {
        return Object.keys(this._players).length;
    }

    /**
     * Check if a game exists.
     * @param  {string} gameId
     * @return {boolean}
     */
    doesGameExist(gameId) {
        return (this._games[gameId] instanceof Game);
    }

    /**
     * Check if a player exists.
     * @param  {string} playerId
     * @return {boolean}
     */
    doesPlayerExist(playerId) {
        return (this._players[playerId] instanceof Player);
    }

    /**
     * Find an opponent for a given player.
     * @param {Player} playerX
     */
    findOpponent(playerX) {
        if (!(playerX instanceof Player)) {
    		throw 'Invalid argument playerX';
    	}

    	for (let playerId in this._players) {
    		if (playerId === playerX.id || this._players[playerId].status !== Player.Status.AwaitingOpponent) {
    			continue;
    		}

    		const playerO = this._players[playerId];
    		const game = new Game(playerX, playerO);
    		playerX.status = Player.Status.Playing;
    		playerO.status = Player.Status.Playing;

    		playerX.socket.emit('game.start', {
    			gameId: game.id,
    			isMyTurn: (game.turn === Game.Marker.X),
                players: {
                    me: {
                        marker: Game.Marker.X
                    },
                    opponent: {
                        id: game.playerO.id,
                        name: game.playerO.name,
                        marker: Game.Marker.O
                    }
                }
    		});

    		playerO.socket.emit('game.start', {
    			gameId: game.id,
                isMyTurn: (game.turn === Game.Marker.O),
    			players: {
                    me: {
        				marker: Game.Marker.O
        			},
        			opponent: {
        				id: playerX.id,
        				name: playerX.name,
                        marker: Game.Marker.X
        			}
                }
    		});

            this._games[game.id] = game;

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
