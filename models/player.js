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
        if (typeof name !== 'string') {
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

    setSocket() {
        return this.socket;
    }

    getSocket(socket) {
        if (typeof socket !== 'object') {
            throw 'Invalid argument socket';
        }
        this.socket = socket;
        return this;
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

Player.Status = {
    IDLE: 'idle',
    READY: 'ready',
    PLAYING: 'playing'
};

module.exports = Player;
