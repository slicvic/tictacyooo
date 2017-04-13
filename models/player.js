class Player {
    constructor(id, name, status, socket) {
        this.setId(id);
        this.setName(name);
        this.setStatus(status);
        this.setSocket(socket);
    }

    getId() {
        return this.id;
    }

    setId(id) {
        if (typeof id !== 'string') {
            throw 'Invalid argument id';
        }
        this.id = id;
        return this;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        if (!Player.isNameValid(name)) {
            throw 'Invalid argument name';
        }
        this.name = name;
        return this;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status) {
        if (!(typeof status === 'string' && Player.isStatusValid(status))) {
            throw 'Invalid argument status';
        }
        this.status = status;
        return this;
    }

    getSocket() {
        return this.socket;
    }

    setSocket(socket) {
        if (typeof socket !== 'object') {
            throw 'Invalid argument socket';
        }
        this.socket = socket;
        return this;
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

    static isNameValid(name) {
        return (typeof name === 'string' && name.length >= Player.MINIMUM_NAME_LENGTH);
    }
}

Player.MINIMUM_NAME_LENGTH = 3;

Player.Status = {
    IDLE: 'idle',
    AWAITING_OPPONENT: 'awaitingOpponent',
    PLAYING: 'playing'
};

module.exports = Player;
