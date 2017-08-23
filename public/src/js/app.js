const app = function (Vue) {
    const SERVER_URL = window.location.origin;

    const State = {
        Login: 'Login',
        AwaitingOpponent: 'AwaitingOpponent',
        Playing: 'Playing'
    };

    const GameStatus = {
        Draw: 'Draw'
    };

    const vm = new Vue({
        el: '#app',
        data: {
            socket: null,
            state: State.Login,

            user: {
                id: '',
                name: '',
                piece: ''
            },

            opponent: {
                id: '',
                name: '',
                possessiveName: '',
                piece: ''
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
                id: ''
            },

            gameCard: {
                feed: '',
                board: [
                    {text: ''},
                    {text: ''},
                    {text: ''},
                    {text: ''},
                    {text: ''},
                    {text: ''},
                    {text: ''},
                    {text: ''},
                    {text: ''}
                ]
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
                    this.setState(State.AwaitingOpponent);
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
                    this.gameCard.feed = this.opponent.possessiveName + ' turn!';
                    this.gameCard.board[data.cellNumber - 1].text = this.user.piece;
                    this.checkGameStatus(data.status);
                } else {
                    if (data.message != 'Not so fast, bud!') {
                        this.showAlert({
                            message: data.message,
                        });
                    }
                }
            });

            this.socket.on('game.opponentMove', (data) => {
                this.gameCard.feed = 'Your turn!';
                this.gameCard.board[data.cellNumber - 1].text = this.opponent.piece;
                this.checkGameStatus(data.status);
            });

            this.socket.on('game.start', (data) => {
                this.game.id = data.gameId;
                this.user.piece = data.user.piece;
                this.opponent.id = data.opponent.id;
                this.opponent.name = data.opponent.name;
                this.opponent.piece = data.opponent.piece;
                this.opponent.possessiveName = this.generatePossesiveName(data.opponent.name);
                this.gameCard.feed = (data.user.firstTurn) ? 'You go first!' : this.opponent.name + ' goes first!';
                for (let i in this.gameCard.board) {
                    this.gameCard.board[i].text = '';
                }
                this.state = State.Playing;
            });

            this.socket.on('game.opponentLeft', (data) => {
                this.gameOver(data.message);
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
                    case this.user.piece:
                        this.gameOver('You win!');
                        break;
                    case this.opponent.piece:
                        this.gameOver('You lose!');
                        break;
                    case GameStatus.Draw:
                        this.gameOver('Draw!');
                        break;
                }
            },
            setState: function(state) {
                switch (state) {
                    case State.AwaitingOpponent:
                        this.state = State.AwaitingOpponent;
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
            hideAlert() {
                this.alert.show = false;
                this.alert.okButton.onClick = null;
                this.alert.cancelButton.show = false;
                this.alert.cancelButton.onClick = null;
            },
            gameOver(message) {
                this.gameCard.feed = 'Game Over!'

                this.showAlert({
                    message: message,
                    okButton: {
                        text: 'Play Again',
                        onClick: () => {
                            this.setState(State.AwaitingOpponent);
                        }
                    },
                    cancelButton: {
                        text: "I'm out",
                        onClick: () => {
                            this.setState(State.Login);
                        }
                    }
                });
            },
            generatePossesiveName(name) {
                return name + (name[name.length - 1].toLowerCase() === 's' ? "'" : "'s");
            }
        },
        computed: {
            isStateLogin() {
                return this.state === State.Login;
            },
            isStateAwaitingOpponent() {
                return this.state === State.AwaitingOpponent;
            },
            isStatePlaying() {
                return this.state === State.Playing;
            }
        }
    });

    return {
        vm
    }
}(Vue);
