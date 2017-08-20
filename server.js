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
app.use(express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));

socketManager.onConnect(function(socket, socketId) {
    this.emitStats({
        players: stateManager.countPlayers(),
        games: stateManager.countGames()
    });

    // Player disconnected
    this.onDisconnect(socket, () => {
        // Change player status to "away"
        if (stateManager.players[socketId] instanceof Player) {
            stateManager.players[socketId].status = Player.Status.Away;
        }

        // Notify opponent and update game status, if in game
        for (let gameId in stateManager.games) {
            const game = stateManager.games[gameId];
            if (game.status === Game.Status.InProgress && game.getPlayerById(socketId)) {
                let opponent;
                if (socketId === game.playerO.id) {
                    opponent = game.playerX;
                    game.status = Game.Status.Win.X;
                } else {
                    opponent = game.playerO;
                    game.status = Game.Status.Win.O;
                }
                this.emitOpponentLeft(opponent.socket);
            }
        }
    });

    // Player joined game
    this.onJoin(socket, (data) => {
        try {
            if (!(typeof data === 'object' && typeof data.name === 'string')) {
                throw Error('Invalid request data');
            }
            const player = new Player({id: socketId, name: data.name, socket: socket});
            stateManager.players[player.id] = player;
            this.emitJoinResponse(socket, {
                success: true,
                playerId: player.id
            });
        } catch (e) {
            this.emitJoinResponse(socket, {
                success: false,
                message: e.message
            });
        }
    });

    // Player is looking for opponent
    this.onFindOpponent(socket, (data) => {
        if (typeof data === 'object'
            && typeof data.playerId === 'string'
            && stateManager.doesPlayerExist(data.playerId)
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

    // Player made a move
    this.onMove(socket, (data) => {
        if (typeof data === 'object'
            && typeof data.gameId === 'string'
            && typeof data.playerId === 'string'
            && typeof data.cellNumber === 'number'
            && stateManager.doesPlayerExist(data.playerId)
            && stateManager.doesGameExist(data.gameId)
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
