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

        onPlayerMove(callback) {
            this.socket.on('player.move', callback.bind(this));
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

        emitStats({totalPlayers = 0, totalGames = 0} = {}) {
            const stats = {
                totalPlayers,
                totalGames
            };
            this.io.emit('stats', stats);
            this.socket.emit('stats', stats);
        }
    }

    return new SocketManager(io);
}

module.exports = SocketManager;
