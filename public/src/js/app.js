var app = function (Vue) {
    const SERVER_URL = 'http://192.167.10.10:3001';
    const STATE_JOIN = 'join';
    const STATE_AWAITING_OPPONENT = 'awaitingOpponent';
    const STATE_PLAYING = 'playing';

    return new Vue({
        el: '#app',
        data: {
            state: STATE_JOIN,

            player: {
                name: ''
            },

            alert: {
                message: '',
                show: false
            }
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
