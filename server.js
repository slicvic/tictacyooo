const port       = 12345;
const express    = require('express');
const path       = require('path');
const app        = express();
const httpServer = require('http').Server(app);
const io         = require('socket.io')(httpServer);
const Player     = require('./models/player');
const Game       = require('./models/game');
const stateManager  = require('./services/state-manager')();
const socketManager = require('./services/socket-manager')(io);

httpServer.listen(port);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));

socketManager.onConnect(function(socket, userId) {
    // On player disconnect
    this.onDisconnect(socket, () => {
        // Remove player record
        if (stateManager.players[userId] instanceof Player) {
            delete stateManager.players[userId];
        }

        // Notify their opponent and if in game, update game status
        for (let gameId in stateManager.games) {
            const game = stateManager.games[gameId];
            if (game.status === Game.Status.InProgress && game.getPlayerById(userId)) {
                let opponent;
                if (userId === game.playerO.id) {
                    opponent = game.playerX;
                    game.status = Game.Status.X;
                } else {
                    opponent = game.playerO;
                    game.status = Game.Status.O;
                }
                this.emitOpponentLeft(opponent.socket);
                // Remove game record
                delete stateManager.games[gameId];
            }
        }
    });

    // On player login
    this.onLogin(socket, (data) => {
        try {
            if (!(typeof data === 'object' && typeof data.name === 'string')) {
                throw Error('Invalid request data');
            }
            const player = new Player({id: userId, name: data.name, socket: socket});
            stateManager.players[player.id] = player;
            this.emitLoginResponse(socket, {
                success: true,
                playerId: player.id
            });
        } catch (e) {
            this.emitLoginResponse(socket, {
                success: false,
                message: e.message
            });
        }
    });

    // On find opponent
    this.onFindOpponent(socket, (data) => {
        if (typeof data === 'object'
            && typeof data.playerId === 'string'
            && stateManager.playerExists(data.playerId)
        ) {
            const player = stateManager.players[data.playerId];
            player.status = Player.Status.AwaitingOpponent;
            this.emitFindOpponentResponse(socket, {success: true});
            stateManager.findOpponent(player);
        } else {
            this.emitFindOpponentResponse(socket, {
                success: false,
                message: 'Invalid request data'
            });
        }
    });

    // On player move
    this.onMove(socket, (data) => {
        if (typeof data === 'object'
            && typeof data.gameId === 'string'
            && typeof data.playerId === 'string'
            && typeof data.cellNumber === 'number'
            && stateManager.playerExists(data.playerId)
            && stateManager.gameExists(data.gameId)
        ) {
            const game = stateManager.games[data.gameId];
            const player = stateManager.players[data.playerId];

            try {
                game.makeMove(player.id, data.cellNumber);

                this.emitMoveResponse(socket, {
                    cellNumber: data.cellNumber,
                    status: game.status,
                    success: true
                });

                // Notify opponent
                const opponent = (player.id === game.playerX.id) ? game.playerO : game.playerX;
                this.emitOpponentMove(opponent.socket, {
                    cellNumber: data.cellNumber,
                    status: game.status
                });

                // Remove game record
                if (game.isOver()) {
                    delete stateManager.games[game.id];
                }
            } catch (e) {
                this.emitMoveResponse(socket, {
                    success: false,
                    message: e.message,
                });
            }
        } else {
            this.emitMoveResponse(socket, {
                success: false,
                message: 'Invalid request data'
            });
        }
    });
});
