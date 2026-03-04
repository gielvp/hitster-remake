const authScreen = {
    emits: ['back', 'success'],
    template: `
    <div class="auth-screen">

        <div class="top-bar">
            <button class="back-btn" @click="$emit('back')">← HOME</button>
        </div>

        <div class="auth-container">

            <div class="auth-logo">HITSTER</div>

            <!-- TABS -->
            <div class="auth-tabs">
                <button class="auth-tab" :class="{ active: tab === 'login' }" @click="switchTab('login')">LOGIN</button>
                <button class="auth-tab" :class="{ active: tab === 'register' }" @click="switchTab('register')">REGISTER</button>
            </div>

            <!-- ERROR -->
            <div class="auth-error" v-if="error">{{ error }}</div>

            <!-- LOGIN FORM -->
            <div class="auth-form" v-if="tab === 'login'">
                <div class="form-group">
                    <label>EMAIL</label>
                    <input v-model="login.email" type="email" placeholder="your@email.com" @keyup.enter="submitLogin" />
                </div>
                <div class="form-group">
                    <label>PASSWORD</label>
                    <input v-model="login.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" @keyup.enter="submitLogin" />
                    <button class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">{{ showPassword ? 'HIDE' : 'SHOW' }}</button>
                </div>
                <button class="auth-submit-btn" @click="submitLogin" :class="{ loading: loading }">
                    <span v-if="!loading">LOGIN</span>
                    <span v-else>...</span>
                </button>
                <p class="auth-switch">No account? <span @click="switchTab('register')">Register here</span></p>
            </div>

            <!-- REGISTER FORM -->
            <div class="auth-form" v-if="tab === 'register'">
                <div class="form-group">
                    <label>USERNAME</label>
                    <input v-model="register.username" type="text" placeholder="Choose a username" maxlength="20" @keyup.enter="submitRegister" />
                </div>
                <div class="form-group">
                    <label>EMAIL</label>
                    <input v-model="register.email" type="email" placeholder="your@email.com" @keyup.enter="submitRegister" />
                </div>
                <div class="form-group">
                    <label>PASSWORD</label>
                    <input v-model="register.password" :type="showPassword ? 'text' : 'password'" placeholder="Min. 6 characters" @keyup.enter="submitRegister" />
                    <button class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">{{ showPassword ? 'HIDE' : 'SHOW' }}</button>
                </div>
                <div class="form-group">
                    <label>CONFIRM PASSWORD</label>
                    <input v-model="register.confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="Repeat password" @keyup.enter="submitRegister" />
                </div>
                <button class="auth-submit-btn" @click="submitRegister" :class="{ loading: loading }">
                    <span v-if="!loading">CREATE ACCOUNT</span>
                    <span v-else>...</span>
                </button>
                <p class="auth-switch">Already have an account? <span @click="switchTab('login')">Login here</span></p>
            </div>

        </div>
    </div>
    `,

    data() {
        return {
            tab: 'login',
            showPassword: false,
            loading: false,
            error: '',
            login: { email: '', password: '' },
            register: { username: '', email: '', password: '', confirmPassword: '' },
        };
    },

    methods: {
        switchTab(tab) {
            this.tab = tab;
            this.error = '';
        },

        submitLogin() {
            this.error = '';
            const { email, password } = this.login;
            if (!email || !password) { this.error = 'Please fill in all fields.'; return; }
            this.loading = true;
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('hitster_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                if (!user) {
                    this.error = 'Invalid email or password.';
                    this.loading = false;
                    return;
                }
                localStorage.setItem('hitster_session', JSON.stringify(user));
                this.loading = false;
                this.$emit('success');
            }, 600);
        },

        submitRegister() {
            this.error = '';
            const { username, email, password, confirmPassword } = this.register;
            if (!username || !email || !password || !confirmPassword) { this.error = 'Please fill in all fields.'; return; }
            if (password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
            if (password !== confirmPassword) { this.error = 'Passwords do not match.'; return; }
            this.loading = true;
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('hitster_users') || '[]');
                if (users.find(u => u.email === email)) {
                    this.error = 'An account with this email already exists.';
                    this.loading = false;
                    return;
                }
                const newUser = { id: Date.now(), username, email, password, picture: null, selectedAvatar: null, avatarBg: null, avatarEmoji: null };
                users.push(newUser);
                localStorage.setItem('hitster_users', JSON.stringify(users));
                localStorage.setItem('hitster_session', JSON.stringify(newUser));
                this.loading = false;
                this.$emit('success');
            }, 600);
        },
    }
};