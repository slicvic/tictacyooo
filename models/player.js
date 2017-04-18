class Player {
    constructor(id, name, status, socket) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.socket = socket;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = String(id);
    }

    get name() {
        return this._name;
    }

    set name(name) {
        name = String(name);
        if (!(name.length >= Player.NAME_MIN_LENGTH && name.length <= Player.NAME_MAX_LENGTH)) {
            throw 'Invalid argument name';
        }
        this._name = name;
    }

    get status() {
        return this._status;
    }

    set status(status) {
        if (!Player.isStatusValid(status)) {
            throw 'Invalid argument status';
        }
        this._status = status;
    }

    get socket() {
        return this._socket;
    }

    set socket(socket) {
        if (typeof socket !== 'object') {
            throw 'Invalid argument socket';
        }
        this._socket = socket;
    }

    static create(name, socket, status = null, id = null) {
        const buffer = new Buffer(socket.request.connection.remoteAddress + socket.request.headers['user-agent']);
        status = (null === status) ? Player.Status.IDLE : status;
        id = (null === id) ? Date.now().toString() : id;
        return new Player(id, name, status, socket);
    }

    static isStatusValid(status) {
        for (let key in Player.Status) {
            if (status === Player.Status[key]) {
                return true;
            }
        }
        return false;
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
