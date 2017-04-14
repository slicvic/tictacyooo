const port       = 3001;
const express    = require('express');
const path       = require('path');
const app        = express();
const httpServer = require('http').Server(app);
const io         = require('socket.io')(httpServer);
const Player     = require('./models/player');
const Game       = require('./models/game');
const socketManager = require('./services/socket-manager')(io);
const stateManager  = require('./services/state-manager')();

httpServer.listen(port);

app.use(express.static(path.join(__dirname, 'public')));

socketManager.onConnect(function(socket) {
    this.onPlayerEnter((data) => {
        if (typeof data === 'object' && typeof data.name === 'string') {
            try {
                const player = Player.create(data.name, socket);
                stateManager.players[player.id] = player;
                this.emitPlayerEnter(true, player.id);
            } catch (e) {
                this.emitPlayerEnter(false, null, e+'Whoops! We ran into a problem, no biggie, just try again!');
            }
        } else {
            this.emitPlayerEnter(false, null, `Whoops! We didn't get your name, make sure it's at least ${Player.MINIMUM_NAME_LENGTH} characters!`);
        }
    });

    this.onPlayerAwaitingOpponent((data) => {
        if (typeof data === 'object' && typeof data.playerId === 'string' && stateManager.players[data.playerId] instanceof Player) {
            const player = stateManager.players[data.playerId];
            player.status = Player.Status.AWAITING_OPPONENT;
            this.emitPlayerAwaitingOpponent(true);
            stateManager.findOpponent(player);
        } else {
            this.emitPlayerAwaitingOpponent(false, 'Whoops! We ran into a problem, no biggie, just try again!');
        }
    });
});
