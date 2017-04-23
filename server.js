const port       = 3001;
const express    = require('express');
const path       = require('path');
const app        = express();
const httpServer = require('http').Server(app);
const io         = require('socket.io')(httpServer);
const Player     = require('./models/player');
const socketManager = require('./services/socket-manager')(io);
const stateManager  = require('./services/state-manager')();

httpServer.listen(port);

app.use(express.static(path.join(__dirname, 'public')));

socketManager.onConnect(function(socket) {
    // Send counts
    this.emitCounts({
        totalPlayers: stateManager.countPlayers(),
        totalGames: stateManager.countGames()
    });

    // Player signed in to the app
    this.onJoin(socket, (data) => {
        try {
            if (!(typeof data === 'object' && typeof data.name === 'string')) {
                throw 'Invalid request data';
            }
            const player = Player.create(data.name, socket);
            stateManager.players[player.id] = player;
            this.emitJoinResponse(socket, {
                success: true,
                playerId: player.id
            });
        } catch (e) {
            this.emitJoinResponse(socket, {
                success: false,
                message: e
            });
        }
    });

    // Player is looking for opponent
    this.onFindOpponent(socket, (data) => {
        if (
            typeof data === 'object'
            && typeof data.playerId === 'string'
            && stateManager.doesPlayerExist(data.playerId)
        ) {
            const player = stateManager.players[data.playerId];
            player.status = Player.Status.AWAITING_OPPONENT;
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
        if (
            typeof data === 'object'
            && typeof data.gameId === 'string'
            && typeof data.playerId === 'string'
            && typeof data.squareNumber === 'string'
            && stateManager.isPlayerInGame(data.playerId, data.gameId)
        ) {
            const game = stateManager.games[data.gameId];
            const player = stateManager.players[data.playerId];
            const opponent = (player.id === game.playerX.id) ? game.playerO : game.playerX;
            if (game.isPlayerTurn(player.id)) {
                game.switchTurn();
                this.emitMoveResponse(socket, {
                    success: true
                });
                // Notify opponent
                this.emitOpponentMove(opponent.socket, {
                    squareNumber: data.squareNumber
                });
            } else {
                this.emitMoveResponse(socket, {
                    success: false,
                    message: "It's not your turn"
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
