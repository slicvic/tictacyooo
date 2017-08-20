/**
 * This class represents a player.
 */
class Player {
    /**
     * Create a new player.
     * @param  {string} id
     * @param  {string} name
     * @param  {Player.Status} status
     * @param  {Object} socket
     * @throws {Error}
     */
    constructor({id, name, socket, status = Player.Status.Idle}) {
        if (!(typeof id === 'string')) {
            throw Error('Invalid argument id');
        }

        if (!(typeof name === 'string' && name.length >= Player.NAME_MIN_LENGTH && name.length <= Player.NAME_MAX_LENGTH)) {
            throw Error(`Yo name must be between ${Player.NAME_MIN_LENGTH} and ${Player.NAME_MAX_LENGTH} characters!`);
        }

        if (!(
            typeof socket === 'object'
            && typeof socket.on === 'function'
            && typeof socket.emit === 'function'
        )) {
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
     * @return {Player.Status}
     */
    get status() {
        return this._status;
    }

    /**
     * Set status.
     * @param  {Player.Status} status
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

Player.Status = {
    Idle: 'Idle',
    AwaitingOpponent: 'AwaitingOpponent',
    Playing: 'Playing',
    Away: 'Away'
};

Player.NAME_MIN_LENGTH = 3;
Player.NAME_MAX_LENGTH = 10;

module.exports = Player;
