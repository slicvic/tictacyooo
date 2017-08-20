const app = function (Vue) {
    const SERVER_URL = 'http://192.167.10.10:3001';
    let State = {
        Join: 'join',
        AwaitingOpponent: 'awaitingOpponent',
        Playing: 'playing'
    };

    const vm = new Vue({
        el: '#app',
        data: {
            socket: null,

            state: State.Join,

            user: {
                id: '',
                name: ''
            },

            toast: {
                message: '',
                isDisplayed: false
            },

            alert: {
                message: '',
                isDisplayed: false,
                okButton: {
                    text: 'OK',
                    onClick: null
                },
                cancelButton: {
                    text: 'Cancel',
                    isDisplayed: false
                }
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
                        marker: 'O',
                    },
                    opponent: {
                        id: '',
                        name: 'opponent',
                        marker: 'X'
                    }
                }
            }
        },
        created() {
            this.socket = io(SERVER_URL);

            this.socket.on('stats', (data) => {
                this.stats.players = data.players;
                this.stats.games = data.games;
            });

            this.socket.on('player.joinResponse', (data) => {
                if (data.success) {
                    this.user.id = data.playerId;
                    this.state = State.AwaitingOpponent;
                    this.socket.emit('player.findOpponent', {
                        playerId: this.user.id
                    });
                } else {
                    this.showToast(data.message);
                }
            });

            this.socket.on('player.findOpponentResponse', (data) => {
                if (!data.success) {
                    this.state = State.Join;
                    this.showToast(data.message);
                }
            });

            this.socket.on('player.moveResponse', (data) => {
                if (data.success) {
                    this.game.isMyTurn = false;
                    this.game.board[data.cellNumber - 1] = this.game.players.me.marker;
                    if (data.status === this.game.players.me.marker) {
                        this.showAlert({
                            message: 'You won!'
                        });
                    }
                } else {
                    this.showToast(data.message);
                }
            });

            this.socket.on('game.opponentMove', (data) => {
                this.game.isMyTurn = true;
                this.game.board[data.cellNumber - 1] = this.game.players.opponent.marker;
                if (data.status === this.game.players.opponent.marker) {
                    this.showAlert({
                        message: this.game.players.opponent.name + ' won!'
                    });
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
                this.state = State.Playing;
            });

            this.socket.on('game.opponentLeft', (data) => {
                this.showAlert({
                    message: data.message,
                    okButton: {
                        text: 'OK',
                        onClick: () => {
                            this.state = State.AwaitingOpponent;
                            this.socket.emit('player.findOpponent', {
                                playerId: this.user.id
                            });
                        }
                    }
                });
            });
        },
        methods: {
            onJoin() {
                this.hideToast();

                this.socket.emit('player.join', {
                    name: this.user.name
                });
            },
            makeMove(cellNumber) {
                this.socket.emit('player.move', {
                    gameId: this.game.id,
                    playerId: this.user.id,
                    cellNumber: cellNumber
                });
            },
            showToast(message) {
                this.toast.message = message;
                this.toast.isDisplayed = true;
            },
            hideToast() {
                this.toast.isDisplayed = false;
            },
            showAlert({message, okButton = {text: 'OK', onClick: null}, cancelButton = {text: 'Cancel', isDisplayed: false}} = {}) {
                this.alert.message = message;
                this.alert.okButton.text = okButton.text;
                this.alert.okButton.onClick = () => {
                    if (typeof okButton.onClick === 'function') {
                        okButton.onClick()
                    }
                    this.hideAlert();
                }

                if (cancelButton.isDisplayed) {
                    this.alert.cancelButton.text = cancelButton.text;
                    this.alert.cancelButton.isDisplayed = true;
                }

                this.alert.isDisplayed = true;
            },
            hideAlert() {
                this.alert.isDisplayed = false;
                this.alert.okButton.onClick = null;
            }
        },
        computed: {
            isStateJoin() {
                return this.state === State.Join;
            },
            isStateAwaitingOpponent() {
                return this.state === State.AwaitingOpponent;
            },
            isStatePlaying() {
                return this.state === State.Playing;
            },
            whosTurn() {
                return (this.game.isMyTurn) ? 'Your' : `${this.game.players.opponent.name}'s`;
            }
        }
    });

    return {
        vm: vm
    }
}(Vue);
