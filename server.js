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

    this.emitStats({
        totalPlayers: stateManager.countPlayers(),
        totalGames: stateManager.countGames()
    });

    this.onPlayerJoin(socket, (data) => {
        try {
            if (!(typeof data === 'object' && typeof data.name === 'string')) {
                throw 'Invalid request data';
            }
            const player = Player.create(data.name, socket);
            stateManager.players[player.id] = player;
            this.emitPlayerJoinResponse(socket, {
                success: true,
                playerId: player.id
            });
        } catch (e) {
            this.emitPlayerJoinResponse(socket, {
                success: false,
                message: e
            });
        }
    });

    this.onPlayerFindOpponent(socket, (data) => {
        if (
            typeof data === 'object'
            && typeof data.playerId === 'string'
            && stateManager.doesPlayerExist(data.playerId)
        ) {
            const player = stateManager.players[data.playerId];
            player.status = Player.Status.AWAITING_OPPONENT;
            this.emitPlayerFindOpponentResponse(socket, {success: true});
            stateManager.findOpponent(player);
        } else {
            this.emitPlayerFindOpponentResponse(socket, {
                success: false,
                message: 'Invalid request data'
            });
        }
    });

    // When a player makes a move, notify the opponent of the move
    this.onPlayerMove(socket, (data) => {
        if (
            typeof data === 'object'
            && typeof data.gameId === 'string'
            && typeof data.playerId === 'string'
            && typeof data.squareNumber === 'string'
            && stateManager.isPlayerInGame(data.playerId, data.gameId)
        ) {
            const game = stateManager.games[data.gameId];
            const opponent = (data.playerId === game.playerX.id) ? game.playerO : game.playerX;
            if (game.isPlayerTurn(opponent.id)) {
                this.notifyOpponentMove(opponent.socket, {
                    squareNumber: data.squareNumber
                });
                this.emitPlayerMoveResponse(socket, {
                    success: true
                });
            } else {
                this.emitPlayerMoveResponse(socket, {
                    success: false,
                    message: "It's not your turn"
                });
            }
        } else {
            this.emitPlayerMoveResponse(socket, {
                success: false,
                message: 'Invalid request data'
            });
        }
    });
});
