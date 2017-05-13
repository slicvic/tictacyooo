/**
 * A player object.
 */
class Player {
    /**
     * Create a new player.
     * @param  {string} id
     * @param  {string} name
     * @param  {Object} socket
     * @return {Player}
     */
    static create(id, name, socket) {
        return new Player(id, name, Player.Status.Idle, socket);
    }

    /**
     * Create a new player.
     * @param  {string} id
     * @param  {string} name
     * @param  {string} status
     * @param  {Object} socket
     * @throws {Error}
     */
    constructor(id, name, status, socket) {
        if (!(typeof name === 'string' && name.length >= Player.NAME_LENGTH_MIN && name.length <= Player.NAME_LENGTH_MAX)) {
            throw Error(`Yo name must be between ${Player.NAME_LENGTH_MIN} and ${Player.NAME_LENGTH_MAX} characters!`);
        }

        if (!(typeof socket === 'object')) {
            throw Error('Invalid argument socket');
        }

        this._id = id;
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

Player.NAME_LENGTH_MIN = 3;
Player.NAME_LENGTH_MAX = 10;

Player.Status = {
    Idle: 'Idle',
    AwaitingOpponent: 'AwaitingOpponent',
    Playing: 'Playing',
    Away: 'Away'
};

module.exports = Player;
