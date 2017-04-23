/**
 * Represents a player.
 */
class Player {
    /**
     * Create a new player.
     * @param {string} name
     * @param {Object} socket
     * @param {string} status
     * @param {string} id
     * @return {Player}
     */
    static create(name, socket, status = null, id = null) {
        const buffer = new Buffer(socket.request.connection.remoteAddress + socket.request.headers['user-agent']);
        status = (null === status) ? Player.Status.IDLE : status;
        id = (null === id) ? Date.now().toString() : id;
        return new Player(id, name, status, socket);
    }

    /**
     * Check if a given status is valid or not.
     * @return {boolean}
     */
    static isStatusValid(status) {
        for (let key in Player.Status) {
            if (status === Player.Status[key]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create a new player.
     * @param {string} id
     * @param {string} name
     * @param {string} status
     * @param {Object} socket
     */
    constructor(id, name, status, socket) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.socket = socket;
    }

    /**
     * Get id.
     * @return {string}
     */
    get id() {
        return this._id;
    }

    /**
     * Set id.
     * @param {string} id
     */
    set id(id) {
        this._id = String(id);
    }

    /**
     * Get name.
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Set name.
     * @param {string} name
     */
    set name(name) {
        name = String(name);
        if (!(name.length >= Player.NAME_MIN_LENGTH && name.length <= Player.NAME_MAX_LENGTH)) {
            throw 'Invalid argument name';
        }
        this._name = name;
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
     * @param {string} status
     */
    set status(status) {
        if (!Player.isStatusValid(status)) {
            throw 'Invalid argument status';
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

    /**
     * Set socket.
     * @param {Object} socket
     */
    set socket(socket) {
        if (typeof socket !== 'object') {
            throw 'Invalid argument socket';
        }
        this._socket = socket;
    }
}

Player.NAME_MIN_LENGTH = 3;
Player.NAME_MAX_LENGTH = 10;

Player.Status = {
    IDLE: 'idle',
    AWAITING_OPPONENT: 'awaitingOpponent',
    PLAYING: 'playing'
};

module.exports = Player;
