const SocketManager = function(io = {}) {

    class SocketManager {
        constructor(io) {
            this.io = io;
        }

        /**
         * Check when a player connects.
         */
        onConnect(callback) {
            this.io.on('connect', (socket) => {
                callback.call(this, socket);
            });
        }

        /**
         * Check when a player requests to join.
         */
        onPlayerJoin(socket, callback) {
            socket.on('player.join', callback.bind(this));
        }

        /**
         * Check when a player requests opponent.
         */
        onPlayerFindOpponent(socket, callback) {
            socket.on('player.findOpponent', callback.bind(this));
        }

        /**
         * Check when a player makes a move.
         */
        onPlayerMove(socket, callback) {
            socket.on('player.move', callback.bind(this));
        }

        /**
         * Notify a player whether his request to join was successful or not.
         */
        emitPlayerJoinResponse(socket, {success = false, playerId = '', message = ''} = {}) {
            socket.emit('player.joinResponse', {
                success,
                playerId,
                message
            });
        }

        /**
         * Notify a player whether his request to find an opponent was successful or not.
         */
        emitPlayerFindOpponentResponse(socket, {success = false, message = ''} = {}) {
            socket.emit('player.findOpponentResponse', {
                success,
                message
            });
        }

        /**
         * Notify a player whether his move was successful or not.
         */
        emitPlayerMoveResponse(socket, {success = false, message = ''} = {}) {
            socket.emit('player.moveResponse', {
                success,
                message
            });
        }

        /**
         * Notify a player of his opponent's move.
         */
        notifyOpponentMove(socket, {squareNumber = ''} = {}) {
            socket.emit('player.opponentMove', {
                squareNumber
            });
        }

        /**
         * Notify stats to all players.
         */
        emitStats({totalPlayers = 0, totalGames = 0} = {}) {
            this.io.emit('stats', {
                totalPlayers,
                totalGames
            });
        }
    }

    return new SocketManager(io);
}

module.exports = SocketManager;
