const express    = require('express');
const path       = require('path');
const app        = express();
const httpServer = require('http').Server(app);
const io         = require('socket.io')(httpServer);
const port       = 3001;
const Player     = require('./models/player');
const players    = {};

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
					message: "Yo this trippin', try again!"
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
		} else {
			socket.emit('player.awaitingOpponent', {
				success: false,
				message: "Yo this trippin', try again!"
			});
		}
	});
});
