const app = Vue.createApp({
    data() {
        return {
            title: 'HITSTER',
            description: 'listen to it and place it correctly in the timeline',
            startButton: 'START',
            screen: 'home',
        }
    }
});

const mountedApp = app.mount('#app');