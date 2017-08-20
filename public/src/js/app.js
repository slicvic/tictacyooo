const app = function (Vue) {
    const SERVER_URL = window.location.origin;

    let State = {
        Join: 'join',
        FindOpponent: 'findOpponent',
        Playing: 'playing'
    };

    const vueModel = new Vue({
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
                show: false
            },

            alert: {
                message: '',
                show: false,
                okButton: {
                    text: '',
                    onClick: null
                },
                cancelButton: {
                    text: '',
                    show: false,
                    onClick: null
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
                    this.setState(State.FindOpponent);
                } else {
                    this.showAlert({
                        message: data.message
                    });
                }
            });

            this.socket.on('player.findOpponentResponse', (data) => {
                if (!data.success) {
                    this.state = State.Join;
                    this.showAlert({
                        message: data.message
                    });
                }
            });

            this.socket.on('player.moveResponse', (data) => {
                if (data.success) {
                    this.game.isMyTurn = false;
                    this.game.board[data.cellNumber - 1] = this.game.players.me.marker;
                    if (data.status === this.game.players.me.marker) {
                        this.showAlert({
                            message: 'You win!',
                            okButton: {
                                text: 'New Game',
                                onClick: () => {
                                    this.setState(State.FindOpponent);
                                }
                            },
                            cancelButton: {
                                text: 'Peace Out',
                                onClick: () => {
                                    this.setState(State.Join);
                                }
                            }
                        });
                    }
                } else {
                    this.showAlert({
                        message: data.message,
                    });
                }
            });

            this.socket.on('game.opponentMove', (data) => {
                this.game.isMyTurn = true;
                this.game.board[data.cellNumber - 1] = this.game.players.opponent.marker;
                if (data.status === this.game.players.opponent.marker) {
                    this.showAlert({
                        message: this.game.players.opponent.name + ' wins!',
                        okButton: {
                            text: 'New Game',
                            onClick: () => {
                                this.setState(State.FindOpponent);
                            }
                        },
                        cancelButton: {
                            text: 'Peace Out',
                            onClick: () => {
                                this.setState(State.Join);
                            }
                        }
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
                        text: 'New Game',
                        onClick: () => {
                            this.setState(State.FindOpponent);
                        }
                    },
                    cancelButton: {
                        text: 'Peace Out',
                        onClick: () => {
                            this.setState(State.Join);
                        }
                    }
                });
            });
        },
        methods: {
            onJoin() {
                this.hideAlert();
                this.socket.emit('player.join', {
                    name: this.user.name
                });
            },
            setState: function(state) {
                switch (state) {
                    case State.FindOpponent:
                        this.state = State.FindOpponent;
                        this.socket.emit('player.findOpponent', {
                            playerId: this.user.id
                        });
                        break;

                    case State.Join:
                        this.state = State.Join;
                        break;
                }
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
                this.toast.show = true;
            },
            hideToast() {
                this.toast.show = false;
            },
            showAlert({message, okButton = {text: 'Aight', onClick: null}, cancelButton = null} = {}) {
                this.alert.message = message;

                this.alert.okButton.text = okButton.text;
                this.alert.okButton.onClick = () => {
                    this.hideAlert();
                    if (typeof okButton.onClick === 'function') {
                        okButton.onClick()
                    }
                }

                if (cancelButton) {
                    this.alert.cancelButton.text = cancelButton.text;
                    this.alert.cancelButton.show = true;
                    this.alert.cancelButton.onClick = () => {
                        this.hideAlert();
                        if (typeof cancelButton.onClick === 'function') {
                            cancelButton.onClick()
                        }
                    }
                }

                this.alert.show = true;
            },
            hideAlert() {
                this.alert.show = false;
                this.alert.okButton.onClick = null;
                this.alert.cancelButton.show = false;
                this.alert.cancelButton.onClick = null;

            }
        },
        computed: {
            isStateJoin() {
                return this.state === State.Join;
            },
            isStateFindOpponent() {
                return this.state === State.FindOpponent;
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
        vueModel: vueModel
    }
}(Vue);
