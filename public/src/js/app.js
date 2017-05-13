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

            stats: {
                players: 0,
                games: 0
            },

            game: {
                id: '',
                isMyTurn: false,
                board: ['', '', '', '', '', '', '', '', ''],
                players: {
                    me: {
                        marker: '',
                    },
                    opponent: {
                        id: '',
                        name: '',
                        marker: ''
                    }
                }
            }
        },
        created() {
            this.socket = io(SERVER_URL);

            this.socket.on('connect', () => {
                this.socket.on('stats', (data) => {
                    this.stats.players = data.players;
                    this.stats.games = data.games;
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

            this.socket.on('player.moveResponse', (response) => {
                if (response.success) {
                    this.game.isMyTurn = false;
                    this.game.board[response.position - 1] = this.game.players.me.marker;
                } else {
                    this.showToast(response.message);
                }
            });

            this.socket.on('game.start', (data) => {
                this.game.id = data.gameId;
                this.game.isMyTurn = data.isMyTurn;
                this.game.players.me.marker = data.players.me.marker;
                this.game.players.opponent.id = data.players.opponent.id;
                this.game.players.opponent.name = data.players.opponent.name;
                this.game.players.opponent.marker = data.players.opponent.marker;
                this.game.board = ['', '', '', '', '', '', '', '', ''];
                this.state = STATE_PLAYING;
            });

            this.socket.on('game.opponentMove', (response) => {
                this.game.isMyTurn = true;
                this.game.board[response.position - 1] = this.game.players.opponent.marker;
            });
        },
        methods: {
            onJoin() {
                this.hideToast();

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
            makeMove(position) {
                this.socket.emit('player.move', {
                    gameId: this.game.id,
                    playerId: this.user.id,
                    position: position
                });
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
            }
        }
    });
}(Vue);
