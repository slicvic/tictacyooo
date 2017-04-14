const express    = require('express');
const path       = require('path');
const app        = express();
const httpServer = require('http').Server(app);
const io         = require('socket.io')(httpServer);
const port       = 3001;
const math       = require('./helpers/math');
const Player     = require('./models/player');
const Game       = require('./models/game');
const players    = {};
const games      = {};
const socketManager = require('./services/socket-manager')(io);

httpServer.listen(port);
app.use(express.static(path.join(__dirname, 'public')));

socketManager.onConnect(function(socket) {

    this.onPlayerEnter((data) => {
        if (typeof data === 'object' && typeof data.name === 'string') {
            try {
                const player = Player.create(data.name, socket);
                players[player.id] = player;
                this.emitPlayerEnter(true, player.id);
            } catch (e) {
                this.emitPlayerEnter(false, null, 'Whoops! We ran into a problem, no biggie, just try again!');
            }
        } else {
            this.emitPlayerEnter(false, null, `Whoops! We didn't get your name, make sure it's at least ${Player.MINIMUM_NAME_LENGTH} characters!`);
        }
    });

    this.onPlayerAwaitingOpponent((data) => {
        if (typeof data === 'object' && typeof data.playerId === 'string' && players[data.playerId] instanceof Player) {
            players[data.playerId].status = Player.Status.AWAITING_OPPONENT;
            this.emitPlayerAwaitingOpponent(true);
            findOpponent(players[data.playerId]);
        } else {
            this.emitPlayerAwaitingOpponent(false, 'Whoops! We ran into a problem, no biggie, just try again!');
        }
    });
});

function findOpponent(playerX) {
	if (!(playerX instanceof Player)) {
		throw 'Invalid argument playerX';
	}

	for (let playerId in players) {
		if (playerId === playerX.id || players[playerId].status !== Player.Status.AWAITING_OPPONENT) {
			continue;
		}

		const playerO = players[playerId];
		const firstTurn = (math.random() % 2 === 0) ? Game.Symbol.X : Game.Symbol.O;
		const game = Game.create(playerX, playerO);

		games[game.id] = game;

		playerX.setStatus(Player.Status.PLAYING);
		playerO.setStatus(Player.Status.PLAYING);

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
