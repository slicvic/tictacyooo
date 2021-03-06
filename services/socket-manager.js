/**
 * A helper for binding and emitting socket events.
 */
class SocketManager {
    /**
     * Generate a unique user id.
     * @param {Object} socket
     */
    static generateUserId(socket) {
        return Buffer.from(socket.request.connection.remoteAddress + socket.request.headers['user-agent'] + socket.request.headers['cookie']).toString('base64');
    }

    /**
     * Create a new instance.
     * @param {Object} io Instance of Socket.io
     */
    constructor(io) {
        this.io = io;
        this.connectionCount = 0;
    }

    /**
     * Check when a player connects to the socket.
     * @param {Function} callback
     */
    onConnect(callback) {
        this.io.on('connect', (socket) => {
            this.connectionCount++;
            this.emitStats();
            callback.call(this, socket, SocketManager.generateUserId(socket));
        });
    }

    /**
     * Check when a player disconnects.
     */
    onDisconnect(socket, callback) {
        socket.on('disconnect', () => {
            if (this.connectionCount > 0) {
                this.connectionCount--;
                this.emitStats();
            }
            callback.call(this);
        });
    }

    /**
     * Check when a player signs in to the game.
     * @param {Object} socket
     * @param {Function} callback
     */
    onLogin(socket, callback) {
        socket.on('player.login', callback.bind(this));
    }

    /**
     * Check when a player is looking for an opponent.
     * @param {Object} socket
     * @param {Function} callback
     */
    onFindOpponent(socket, callback) {
        socket.on('player.findOpponent', callback.bind(this));
    }

    /**
     * Check when a player makes a move.
     * @param {Object} socket
     * @param {Function} callback
     */
    onMove(socket, callback) {
        socket.on('player.move', callback.bind(this));
    }

    /**
     * Notify a player if his request to login was success or not.
     * @param {Object} socket
     * @param {Object} responseData
     */
    emitLoginResponse(socket, {success = false, playerId = '', message = ''} = {}) {
        socket.emit('player.loginResponse', {
            success,
            playerId,
            message
        });
    }

    /**
     * Notify a player if his request to find an opponent was success or not.
     * @param {Object} socket
     * @param {Object} responseData
     */
    emitFindOpponentResponse(socket, {success = false, message = ''} = {}) {
        socket.emit('player.findOpponentResponse', {
            success,
            message
        });
    }

    /**
     * Notify a player if his move was success or not.
     * @param {Object} socket
     * @param {Object} responseData
     */
    emitMoveResponse(socket, {success = false, message = '', cellNumber, status = null} = {}) {
        socket.emit('player.moveResponse', {
            cellNumber,
            success,
            message,
            status
        });
    }

    /**
     * Notify a player of his opponent's move.
     * @param {Object} socket
     * @param {Object} data
     */
    emitOpponentMove(socket, {cellNumber = '', status = null} = {}) {
        socket.emit('game.opponentMove', {
            cellNumber,
            status
        });
    }

    /**
     * Notify a player if his opponent leaves the game.
     * @param {Object} socket
     */
    emitOpponentLeft(socket) {
        socket.emit('game.opponentLeft', {
            message: 'Yo opponent left! You win!'
        });
    }

    /**
     * Emit stats to all connected sockets.
     */
    emitStats() {
        const data = {
            connectionCount: this.connectionCount
        };
        this.io.emit('stats', data);
    }
}

let instance = null;

function getInstance(io) {
    if (!instance) {
        instance = new SocketManager(io);
    }

    return instance;
}

module.exports = getInstance;
