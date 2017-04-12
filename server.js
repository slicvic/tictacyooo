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
					message: 'Something went wrong, yo. Try again!'
				});
			}
		} else {
			socket.emit('player.enter', {
				success: false,
				message: "That name ain't fly, yo."
			});
		}
	});
});
