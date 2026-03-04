const homeScreen = {
    emits: ['start', 'profile'],
    props: ['currentUser'],
    template: `
    <div class="home-screen">
        <h1>{{ title }}</h1>
        <h2>{{ description }}</h2>
        <button @click="$emit('start')">{{ startButton }}</button>
        <button class="profile-link-btn" @click="$emit('profile')">
            <span v-if="currentUser">👤 {{ currentUser.username }}</span>
            <span v-else>👤 Profile</span>
        </button>
        <p>{{ footerText }}</p>
    </div>`,
    data() {
        return {
            title: 'HITSTER',
            description: 'Listen to it and place it correctly in the timeline',
            startButton: 'START',
            footerText: 'Project by GVP — 2026'
        };
    }
};

const app = Vue.createApp({
    data() {
        return {
            screen: 'home',
            currentUser: null,
        };
    },

    created() {
        const session = localStorage.getItem('hitster_session');
        if (session) this.currentUser = JSON.parse(session);
    },

    methods: {
        goToProfile() {
            // If already logged in, go straight to profile; otherwise go to auth
            if (this.currentUser) {
                this.screen = 'profile';
            } else {
                this.screen = 'auth';
            }
        },
        onAuthSuccess() {
            const session = localStorage.getItem('hitster_session');
            if (session) this.currentUser = JSON.parse(session);
            this.screen = 'profile';
        },
        onLogout() {
            localStorage.removeItem('hitster_session');
            this.currentUser = null;
            this.screen = 'home';
        },
    },

    template: `
        <home-screen
            v-if="screen === 'home'"
            :current-user="currentUser"
            @start="screen = 'game'"
            @profile="goToProfile">
        </home-screen>
        <game-screen
            v-if="screen === 'game'"
            @back="screen = 'home'">
        </game-screen>
        <auth-screen
            v-if="screen === 'auth'"
            @back="screen = 'home'"
            @success="onAuthSuccess">
        </auth-screen>
        <profile-screen
            v-if="screen === 'profile'"
            :current-user="currentUser"
            @back="screen = 'home'"
            @logout="onLogout">
        </profile-screen>
    `
});

app.component('home-screen', homeScreen);
app.component('game-screen', gameScreen);
app.component('auth-screen', authScreen);
app.component('profile-screen', profileScreen);

app.mount('#app');