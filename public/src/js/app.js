var app = function (Vue) {
    const SERVER_URL = 'http://192.167.10.10:3001';
    const STATE_JOIN = 'join';
    const STATE_AWAITING_OPPONENT = 'awaitingOpponent';
    const STATE_PLAYING = 'playing';

    return new Vue({
        el: '#app',
        data: {
            socket: null,

            state: STATE_JOIN,

            user: {
                id: '',
                name: ''
            },

            toast: {
                message: '',
                show: false
            },

            counts: {
                players: 0,
                games: 0
            },

            game: {
                players: {
                    me: {
                        chip: '',
                    },
                    opponent: {
                        id: '',
                        name: '',
                        chip: ''
                    }
                },
                turn: ''
            }
        },
        created() {
            this.socket = io(SERVER_URL);

            this.socket.on('connect', () => {
                this.socket.on('counts', (data) => {
                    this.counts.players = data.players;
                    this.counts.games = data.games;
                });
            });

            this.socket.on('player.joinResponse', (response) => {
                if (response.success) {
                    this.user.id = response.playerId;
                    this.state = STATE_AWAITING_OPPONENT;
                    this.socket.emit('player.findOpponent', {
                        playerId: this.user.id
                    });
                } else {
                    this.showToast(response.message);
                }
            });

            this.socket.on('player.findOpponentResponse', (response) => {
                if (!response.success) {
                    this.state = STATE_JOIN;
                    this.showToast(response.message);
                }
            });

            this.socket.on('game.start', (data) => {
                this.game.players.me.chip = data.me.chip;
                this.game.players.opponent.id = data.opponent.id;
                this.game.players.opponent.name = data.opponent.name;
                this.game.players.opponent.chip = data.opponent.chip;
                this.game.turn = data.turn;
                this.state = STATE_PLAYING;
            });
        },
        methods: {
            onJoin() {
                this.hideToast();

                try {
                    this.validateName(this.user.name);
                } catch(e) {
                    return this.showToast(e.message);
                }

                this.socket.emit('player.join', {
                    name: this.user.name
                });
            },
            showToast(message) {
                this.toast.message = message;
                this.toast.show = true;
            },
            hideToast() {
                this.toast.show = false;
            },
            validateName(name) {
                if (!(typeof name === 'string' && name.length >= 4)) {
                    throw new Error('Name must be at least 5 characters long, yo!');
                }
            },
            makeMove(cellNumber) {
                alert(cellNumber);
            }
        },
        computed: {
            isStateJoin() {
                return this.state === STATE_JOIN;
            },
            isStateAwaitingOpponent() {
                return this.state === STATE_AWAITING_OPPONENT;
            },
            isStatePlaying() {
                return this.state === STATE_PLAYING;
            },
            isMyTurn() {
                return (this.game.turn === this.game.players.me.chip);
            }
        }
    });
}(Vue);
