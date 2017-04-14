const SocketManager = function(io = {}) {

    class SocketManager {
        constructor(io = {}) {
            this.io = io;
            this.socket = null;
        }

        onConnect(callback) {
            this.io.on('connect', (socket) => {
                this.socket = socket;
                callback.call(this, socket);
            });
        }

        onPlayerEnter(callback) {
            this.socket.on('player.enter', callback.bind(this));
        }

        onPlayerAwaitingOpponent(callback) {
            this.socket.on('player.awaitingOpponent', callback.bind(this));
        }

        emitPlayerEnter({success = false, playerId = '', message = ''} = {}) {
            this.socket.emit('player.enter', {
                success,
                playerId,
                message
            });
        }

        emitPlayerAwaitingOpponent({success = false, message = ''} = {}) {
            this.socket.emit('player.awaitingOpponent', {
                success,
                message
            });
        }
    }

    return new SocketManager(io);
}

module.exports = SocketManager;
