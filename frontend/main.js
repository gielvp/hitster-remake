const homeScreen = {
    template: `
    <div class="home-screen">
        <h1>{{ title }}</h1>
        <h2>{{ description }}</h2>
        <button @click="$emit('start')">{{ startButton }}</button>
        <p>{{ footerText }}</p>
    </div>`,
    emits: ['start'],
    data() {
        return {
            title: 'HITSTER',
            description: 'Listen to it and place it correctly in the timeline',
            startButton: 'START',
            footerText: 'Project by GVP — 2026'
        };
    }
};

const gameScreen = {
    template: `
    <div class="game-screen">
        <h1>Game Screen</h1>
        <p>Game content goes here...</p>
        <button @click="$emit('back')">← Back</button>
    </div>`,
    emits: ['back']
};

const app = Vue.createApp({
    data() {
        return {
            screen: 'home'
        };
    },
    template: `
        <home-screen v-if="screen === 'home'" @start="screen = 'game'"></home-screen>
        <game-screen v-if="screen === 'game'" @back="screen = 'home'"></game-screen>
    `
});

app.component('home-screen', homeScreen);
app.component('game-screen', gameScreen);

const mountedApp = app.mount('#app');