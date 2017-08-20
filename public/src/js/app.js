const app = function (Vue) {
    const SERVER_URL = window.location.origin;

    const State = {
        Login: 'login',
        FindOpponent: 'findOpponent',
        Playing: 'playing'
    };

    const GameStatus = {
        InProgress: 'InProgress',
        Draw: 'Draw'
    };

    const vm = new Vue({
        el: '#app',
        data: {
            socket: null,

            state: State.Login,

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
                connectionCount: 0
            },

            game: {
                id: '',
                turn: '',
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

            this.socket.on('stats', (data) => {
                this.stats = data;
            });

            this.socket.on('player.loginResponse', (data) => {
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
                    this.state = State.Login;
                    this.showAlert({
                        message: data.message
                    });
                }
            });

            this.socket.on('player.moveResponse', (data) => {
                if (data.success) {
                    this.game.turn = this.game.players.opponent.marker;
                    this.game.board[data.cellNumber - 1] = this.game.players.me.marker;
                    this.checkGameStatus(data.status);
                } else {
                    this.showAlert({
                        message: data.message,
                    });
                }
            });

            this.socket.on('game.opponentMove', (data) => {
                this.game.turn = this.game.players.me.marker;
                this.game.board[data.cellNumber - 1] = this.game.players.opponent.marker;
                this.checkGameStatus(data.status);
            });

            this.socket.on('game.start', (data) => {
                this.game.id = data.gameId;
                this.game.turn = data.turn;
                this.game.players.me.marker = data.players.me.marker;
                this.game.players.opponent.id = data.players.opponent.id;
                this.game.players.opponent.name = data.players.opponent.name;
                this.game.players.opponent.marker = data.players.opponent.marker;
                this.game.board = ['', '', '', '', '', '', '', '', ''];
                this.state = State.Playing;
            });

            this.socket.on('game.opponentLeft', (data) => {
                this.showGameOverAlert(data.message);
            });
        },
        methods: {
            login() {
                this.socket.emit('player.login', {
                    name: this.user.name
                });
            },
            checkGameStatus: function(status) {
                switch (status) {
                    case this.game.players.me.marker:
                        this.showGameOverAlert('You win!');
                        break;
                    case this.game.players.opponent.marker:
                        this.showGameOverAlert(this.game.players.opponent.name + ' wins!');
                        break;
                    case GameStatus.Draw:
                        this.showGameOverAlert('Draw!');
                        break;
                }
            },
            setState: function(state) {
                switch (state) {
                    case State.FindOpponent:
                        this.state = State.FindOpponent;
                        this.socket.emit('player.findOpponent', {
                            playerId: this.user.id
                        });
                        break;

                    case State.Login:
                        this.state = State.Login;
                        break;
                }
            },
            makeMove(cellNumber) {
                if (this.alert.show) {
                    return;
                }

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
                if (this.alert.show) {
                    return;
                }

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
            showGameOverAlert(message) {
                this.game.turn = '';
                this.showAlert({
                    message: message,
                    okButton: {
                        text: 'New Game',
                        onClick: () => {
                            this.setState(State.FindOpponent);
                        }
                    },
                    cancelButton: {
                        text: 'Peace Out',
                        onClick: () => {
                            this.setState(State.Login);
                        }
                    }
                });
            },
            hideAlert() {
                this.alert.show = false;
                this.alert.okButton.onClick = null;
                this.alert.cancelButton.show = false;
                this.alert.cancelButton.onClick = null;
            }
        },
        computed: {
            isStateLogin() {
                return this.state === State.Login;
            },
            isStateFindOpponent() {
                return this.state === State.FindOpponent;
            },
            isStatePlaying() {
                return this.state === State.Playing;
            },
            whosTurn() {
                switch (this.game.turn) {
                    case this.game.players.me.marker:
                        return 'Yo turn!';
                    case this.game.players.opponent.marker:
                        return `${this.game.players.opponent.name}'s turn!`;
                    default:
                        return '';
                }
            }
        }
    });

    return {
        vm
    }
}(Vue);
