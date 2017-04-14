const math   = require('../helpers/math');
const Player = require('../models/player');
const Game   = require('../models/game');

const StateManager = function() {

    class StateManager {
        constructor(socket = {}) {
            this.socket = socket;
            this.players = {};
            this.games = {};
        }

        countGames() {
            return Object.keys(this.games).length;
        }

        countPlayers() {
            return Object.keys(this.players).length;
        }

        findOpponent(playerX) {
            if (!(playerX instanceof Player)) {
        		throw 'Invalid argument playerX';
        	}

        	for (let playerId in this.players) {
        		if (playerId === playerX.id || this.players[playerId].status !== Player.Status.AWAITING_OPPONENT) {
        			continue;
        		}

        		const playerO = this.players[playerId];
        		const firstTurn = (math.random() % 2 === 0) ? Game.Symbol.X : Game.Symbol.O;
        		const game = Game.create(playerX, playerO);
        		this.games[game.id] = game;
        		playerX.status = Player.Status.PLAYING;
        		playerO.status = Player.Status.PLAYING;

        		playerX.socket.emit('game.start', {
        			gameId: game.id,
        			turn: firstTurn,
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
        			turn: firstTurn,
        			me: {
        				symbol: Game.Symbol.O
        			},
        			opponent: {
        				symbol: Game.Symbol.X,
        				id: playerX.id,
        				name: playerX.name
        			}
        		});

        		break;
        	}
        }
    }

    return new StateManager();
}

module.exports = StateManager;
