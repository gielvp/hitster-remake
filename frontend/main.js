const homeScreen = {
    template: `
    <div class="home-screen">
        <h1>{{ title }}</h1>
        <h2>{{ description }}</h2>
        <buttomn @click="$emit('start')">{{ startButton }}</button>
        <p>{{ footerText }}</p>
        </div>`,
        data() {
            return {
                title: 'HITSTER',
                description: 'listen to it and place it correctly in the timeline',
                startButton: 'START',
                footerText: 'Project by GVP - 2026'
            };
        }
};

const gameScreen = {
    template: `
    <div class="game-screen">
        <h1>Game Screen</h1>
        <p>Game content goes here...</p>
    </div>`
};

const app = Vue.createApp({
    data() {
        return {
            screen: 'home'
        };
    },
});

app.component('home-screen', homeScreen);
app.component('game-screen', gameScreen);

const mountedApp = app.mount('#app');