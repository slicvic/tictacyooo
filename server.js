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

socketManager.onConnect(function(socket, playerId) {
    this.emitStats({
        players: stateManager.countPlayers(),
        games: stateManager.countGames()
    });

    this.onDisconnect(socket, () => {
        if (stateManager.players[playerId] instanceof Player) {
            stateManager.players[playerId].status = Player.Status.Away;
        }

        for (let gameId in stateManager.games) {
            const game = stateManager.games[gameId];
            if (game.getPlayerById(playerId)) {
                game.status = Game.Status.Over;
                const opponent = (playerId === game.playerO.id) ? game.playerX : game.playerO;
                this.emitOpponentLeft(opponent.socket);
            }
        }
    });

    // Player signs in to the game
    this.onJoin(socket, (data) => {
        try {
            if (!(typeof data === 'object' && typeof data.name === 'string')) {
                throw Error('Invalid request data');
            }
            const player = Player.create(playerId, data.name, socket);
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

    // Player makes a move
    this.onMove(socket, (data) => {
        if (typeof data === 'object'
            && typeof data.gameId === 'string'
            && typeof data.playerId === 'string'
            && typeof data.position === 'number'
            && stateManager.doesPlayerExist(data.playerId)
            && stateManager.doesGameExist(data.gameId)
        ) {
            const game = stateManager.games[data.gameId];
            const player = stateManager.players[data.playerId];
            const opponent = (player.id === game.playerX.id) ? game.playerO : game.playerX;
            try {
                game.makeMove(player.id, data.position);
                this.emitMoveResponse(socket, {
                    position: data.position,
                    success: true
                });
                // Notify opponent
                this.emitOpponentMove(opponent.socket, {
                    position: data.position
                });
            } catch (e) {
                this.emitMoveResponse(socket, {
                    success: false,
                    message: e.message
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
