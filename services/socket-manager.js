const SocketManager = function(io = {}) {

    class SocketManager {
        constructor(io) {
            this.io = io;
        }

        onConnect(callback) {
            this.io.on('connect', (socket) => {
                callback.call(this, socket);
            });
        }

        onPlayerEnter(socket, callback) {
            socket.on('player.enter', callback.bind(this));
        }

        onPlayerAwaitingOpponent(socket, callback) {
            socket.on('player.awaitingOpponent', callback.bind(this));
        }

        onPlayerMove(socket, callback) {
            socket.on('player.move', callback.bind(this));
        }

        emitPlayerEnterResponse(socket, {success = false, playerId = '', message = ''} = {}) {
            socket.emit('player.enterResponse', {
                success,
                playerId,
                message
            });
        }

        emitPlayerAwaitingOpponentResponse(socket, {success = false, message = ''} = {}) {
            socket.emit('player.awaitingOpponentResponse', {
                success,
                message
            });
        }

        emitPlayerMove(socket, {squareId = ''} = {}) {
            socket.emit('player.move', {
                squareId
            });
        }

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
