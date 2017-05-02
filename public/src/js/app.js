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

            player: {
                name: ''
            },

            alert: {
                message: '',
                show: false
            },

            counts: {
                players: 0,
                games: 0
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
        },
        methods: {
            isStateJoin() {
                return this.state === STATE_JOIN;
            },
            isStateAwaitingOpponent() {
                return this.state === STATE_AWAITING_OPPONENT;
            },
            isStatePlaying() {
                return this.state === STATE_PLAYING;
            },
            onJoin() {
                this.showAlert('Hi, ' + this.player.name + '!');
            },
            showAlert(message) {
                this.alert.message = message;
                this.alert.show = true;
            },
            hideAlert() {
                this.alert.show = false;
            }
        }
    });
}(Vue);
