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

httpServer.listen(port);
app.use(express.static(path.join(__dirname, 'public')));

io.on('connect', function(socket) {
	socket.on('player.enter', function(data) {
		if (typeof data === 'object' && typeof data.name === 'string') {
			try {
				const player = Player.create(data.name, socket);
				players[player.id] = player;
				socket.emit('player.enter', {
					success: true,
					playerId: player.id
				});
			} catch (e) {
				socket.emit('player.enter', {
					success: false,
					message: "Yo this trippin' man, try again!"
				});
			}
		} else {
			socket.emit('player.enter', {
				success: false,
				message: "Yo that name ain't fly!"
			});
		}
	});

	socket.on('player.awaitingOpponent', function(data) {
		if (typeof data === 'object' && typeof data.playerId === 'string' && players[data.playerId] instanceof Player) {
			players[data.playerId].status = Player.Status.AWAITING_OPPONENT;
			socket.emit('player.awaitingOpponent', {
				success: true
			});
			findOpponent(players[data.playerId]);
		} else {
			socket.emit('player.awaitingOpponent', {
				success: false,
				message: "Yo this trippin' man, try again!"
			});
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
