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
    doesGameExist(gameId) {
        return (this.games[gameId] instanceof Game);
    }

    /**
     * Check if a player exists.
     * @param  {string} playerId
     * @return {boolean}
     */
    doesPlayerExist(playerId) {
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
                        marker: Game.Marker.O,
                        id: game.playerO.id,
                        name: game.playerO.name
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
        				marker: Game.Marker.X,
        				id: playerX.id,
        				name: playerX.name
        			}
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
