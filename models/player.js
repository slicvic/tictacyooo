/**
 * A player object.
 */
class Player {
    /**
     * Create a new player.
     * @param  {string} name
     * @param  {Object} socket
     * @return {Player}
     */
    static create(name, socket) {
        return new Player(name, Player.Status.IDLE, socket);
    }

    /**
     * Create a new player.
     * @param  {string} name
     * @param  {string} status
     * @param  {Object} socket
     * @throws {Error}
     */
    constructor(name, status, socket) {
        if (!(typeof name === 'string' && name.length >= Player.NAME_MIN_LENGTH && name.length <= Player.NAME_MAX_LENGTH)) {
            throw Error('Invalid argument name');
        }

        if (!(
            typeof socket === 'object'
            && typeof socket.request === 'object'
            && typeof socket.request.connection === 'object'
            && typeof socket.request.connection.remoteAddress === 'string'
            && typeof socket.request.headers === 'object'
            && typeof socket.request.headers['user-agent'] === 'string'
        )) {
            throw Error('Invalid argument socket');
        }

        this._id = Buffer.from(socket.request.connection.remoteAddress + socket.request.headers['user-agent'] + Date.now()).toString('base64');
        this._name = name;
        this._socket = socket;
        this.status = status;
    }

    /**
     * Get id.
     * @return {string}
     */
    get id() {
        return this._id;
    }

    /**
     * Get name.
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Get status.
     * @return {string}
     */
    get status() {
        return this._status;
    }

    /**
     * Set status.
     * @param  {string} status
     * @throws {Error}
     */
    set status(status) {
        if (!Player.Status[status]) {
            throw Error('Invalid argument status');
        }

        this._status = status;
    }

    /**
     * Get socket.
     * @return {Object}
     */
    get socket() {
        return this._socket;
    }
}

Player.NAME_MIN_LENGTH = 3;
Player.NAME_MAX_LENGTH = 10;

Player.Status = {
    IDLE: 'IDLE',
    AWAITING_OPPONENT: 'AWAITING_OPPONENT',
    PLAYING: 'PLAYING'
};

module.exports = Player;
