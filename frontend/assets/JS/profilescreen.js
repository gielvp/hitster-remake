const profileScreen = {
    emits: ['back', 'logout'],
    props: ['currentUser'],
    template: `
    <div class="profile-screen">

        <div class="top-bar">
            <button class="back-btn" @click="$emit('back')">← HOME</button>
            <div class="profile-top-title">YOUR PROFILE</div>
            <button class="logout-btn" @click="logout">LOGOUT</button>
        </div>

        <div class="profile-content">

            <!-- AVATAR SECTION -->
            <div class="avatar-section">
                <div class="avatar-preview" :style="avatarStyle">
                    <span v-if="!profile.picture && !profile.selectedAvatar">{{ initials }}</span>
                    <span v-else-if="profile.selectedAvatar && !profile.picture">{{ profile.avatarEmoji }}</span>
                </div>

                <div class="avatar-actions">
                    <button class="avatar-btn" :class="{ active: tab === 'upload' }" @click="tab = 'upload'">Upload photo</button>
                    <button class="avatar-btn" :class="{ active: tab === 'avatars' }" @click="tab = 'avatars'">Pick avatar</button>
                </div>

                <div class="upload-area" v-if="tab === 'upload'" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="onFileDrop">
                    <input type="file" ref="fileInput" accept="image/*" style="display:none" @change="onFileChange" />
                    <span v-if="!profile.picture">📁 Click or drop an image here</span>
                    <span v-else>✓ Photo uploaded — click to change</span>
                </div>

                <div class="avatar-grid" v-if="tab === 'avatars'">
                    <button
                        v-for="avatar in avatars"
                        :key="avatar.id"
                        class="avatar-option"
                        :class="{ selected: profile.selectedAvatar === avatar.id }"
                        @click="selectAvatar(avatar)"
                    >{{ avatar.emoji }}</button>
                </div>
            </div>

            <!-- FORM -->
            <div class="profile-form">
                <div class="form-group">
                    <label>USERNAME</label>
                    <input v-model="profile.username" type="text" placeholder="Enter your username" maxlength="20" @input="markDirty" />
                    <span class="char-count">{{ profile.username.length }}/20</span>
                </div>
                <div class="form-group">
                    <label>EMAIL</label>
                    <input v-model="profile.email" type="email" placeholder="Enter your email" @input="markDirty" />
                </div>

                <div class="form-actions">
                    <button class="save-btn" @click="saveProfile" :class="{ saved: justSaved, dirty: isDirty }">
                        <span v-if="justSaved">✓ SAVED</span>
                        <span v-else>SAVE PROFILE</span>
                    </button>
                </div>

                <p class="profile-note">Your profile is saved locally for now. Once the backend is ready it will sync to your account.</p>
            </div>

        </div>

        <!-- CROP MODAL -->
        <div class="crop-modal-overlay"
            v-if="cropModal.visible"
            @mouseup="stopDrag"
            @mousemove="onDrag"
            @touchmove.prevent="onTouchDrag"
            @touchend="stopDrag"
        >
            <div class="crop-modal">
                <div class="crop-modal-title">Position your photo</div>
                <div class="crop-modal-hint">Drag to reposition · Scroll or pinch to zoom</div>

                <div
                    class="crop-canvas-wrap"
                    @mousedown.prevent="startDrag"
                    @touchstart.prevent="startTouchDrag"
                    @wheel.prevent="onWheel"
                >
                    <img
                        :src="cropModal.src"
                        class="crop-img"
                        :style="cropImgStyle"
                        draggable="false"
                    />
                    <div class="crop-circle-mask"></div>
                </div>

                <div class="crop-zoom-row">
                    <span class="zoom-icon">−</span>
                    <input type="range" min="0.5" max="3" step="0.01" v-model.number="cropModal.scale" class="zoom-slider" />
                    <span class="zoom-icon">+</span>
                </div>

                <div class="crop-actions">
                    <button class="crop-cancel-btn" @click="cancelCrop">Cancel</button>
                    <button class="crop-confirm-btn" @click="confirmCrop">Use photo</button>
                </div>
            </div>
        </div>

    </div>
    `,

    data() {
        return {
            tab: 'avatars',
            isDirty: false,
            justSaved: false,
            profile: {
                username: '',
                email: '',
                picture: null,
                selectedAvatar: null,
                avatarBg: null,
                avatarEmoji: null,
            },
            cropModal: {
                visible: false,
                src: null,
                scale: 1,
                offsetX: 0,
                offsetY: 0,
                dragging: false,
                lastX: 0,
                lastY: 0,
                lastPinchDist: null,
            },
            avatars: [
                { id: 1,  emoji: '🎸', bg: '#e05252' },
                { id: 2,  emoji: '🎹', bg: '#5271e0' },
                { id: 3,  emoji: '🥁', bg: '#52a0e0' },
                { id: 4,  emoji: '🎷', bg: '#9b52e0' },
                { id: 5,  emoji: '🎺', bg: '#e09b52' },
                { id: 6,  emoji: '🎻', bg: '#52e09b' },
                { id: 7,  emoji: '🎤', bg: '#e0529b' },
                { id: 8,  emoji: '🎧', bg: '#52e0d4' },
                { id: 9,  emoji: '🎵', bg: '#FFD600' },
                { id: 10, emoji: '🦄', bg: '#c752e0' },
                { id: 11, emoji: '🐺', bg: '#607d8b' },
                { id: 12, emoji: '🦊', bg: '#e07a52' },
            ],
        };
    },

    computed: {
        initials() {
            return this.profile.username ? this.profile.username.slice(0, 2).toUpperCase() : '?';
        },
        avatarStyle() {
            if (this.profile.picture) {
                return { backgroundImage: `url(${this.profile.picture})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: '0' };
            }
            if (this.profile.selectedAvatar) {
                return { backgroundColor: this.profile.avatarBg, fontSize: '3.5rem' };
            }
            return { backgroundColor: '#2a2a2a' };
        },
        cropImgStyle() {
            return {
                transform: `translate(calc(-50% + ${this.cropModal.offsetX}px), calc(-50% + ${this.cropModal.offsetY}px)) scale(${this.cropModal.scale})`,
                transformOrigin: 'center center',
                position: 'absolute',
                top: '50%',
                left: '50%',
                maxWidth: 'none',
                userSelect: 'none',
                pointerEvents: 'none',
            };
        },
    },

    created() {
        if (this.currentUser) {
            this.profile = {
                username: this.currentUser.username || '',
                email: this.currentUser.email || '',
                picture: this.currentUser.picture || null,
                selectedAvatar: this.currentUser.selectedAvatar || null,
                avatarBg: this.currentUser.avatarBg || null,
                avatarEmoji: this.currentUser.avatarEmoji || null,
            };
        }
    },

    methods: {
        markDirty() {
            this.isDirty = true;
            this.justSaved = false;
        },

        selectAvatar(avatar) {
            this.profile.picture = null;
            this.profile.selectedAvatar = avatar.id;
            this.profile.avatarBg = avatar.bg;
            this.profile.avatarEmoji = avatar.emoji;
            this.markDirty();
        },

        onFileChange(e) {
            const file = e.target.files[0];
            if (file) this.readFile(file);
            e.target.value = ''; // reset so same file can be re-picked after cancel
        },

        onFileDrop(e) {
            const file = e.dataTransfer.files[0];
            if (file) this.readFile(file);
        },

        readFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Open crop modal instead of saving directly
                this.cropModal.src = e.target.result;
                this.cropModal.scale = 1;
                this.cropModal.offsetX = 0;
                this.cropModal.offsetY = 0;
                this.cropModal.visible = true;
            };
            reader.readAsDataURL(file);
        },

        // ── Mouse drag ───────────────────────────────────────────────────
        startDrag(e) {
            this.cropModal.dragging = true;
            this.cropModal.lastX = e.clientX;
            this.cropModal.lastY = e.clientY;
        },
        stopDrag() {
            this.cropModal.dragging = false;
            this.cropModal.lastPinchDist = null;
        },
        onDrag(e) {
            if (!this.cropModal.dragging) return;
            this.cropModal.offsetX += e.clientX - this.cropModal.lastX;
            this.cropModal.offsetY += e.clientY - this.cropModal.lastY;
            this.cropModal.lastX = e.clientX;
            this.cropModal.lastY = e.clientY;
        },

        // ── Touch drag + pinch zoom ──────────────────────────────────────
        startTouchDrag(e) {
            if (e.touches.length === 1) {
                this.cropModal.dragging = true;
                this.cropModal.lastX = e.touches[0].clientX;
                this.cropModal.lastY = e.touches[0].clientY;
            }
        },
        onTouchDrag(e) {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (this.cropModal.lastPinchDist !== null) {
                    const delta = (dist - this.cropModal.lastPinchDist) * 0.01;
                    this.cropModal.scale = Math.min(3, Math.max(0.5, this.cropModal.scale + delta));
                }
                this.cropModal.lastPinchDist = dist;
                this.cropModal.dragging = false;
            } else if (e.touches.length === 1 && this.cropModal.dragging) {
                this.cropModal.offsetX += e.touches[0].clientX - this.cropModal.lastX;
                this.cropModal.offsetY += e.touches[0].clientY - this.cropModal.lastY;
                this.cropModal.lastX = e.touches[0].clientX;
                this.cropModal.lastY = e.touches[0].clientY;
            }
        },

        // ── Scroll to zoom ───────────────────────────────────────────────
        onWheel(e) {
            const delta = -e.deltaY * 0.001;
            this.cropModal.scale = Math.min(3, Math.max(0.5, this.cropModal.scale + delta));
        },

        cancelCrop() {
            this.cropModal.visible = false;
            this.cropModal.src = null;
        },

        confirmCrop() {
            // Draw the cropped circle onto a canvas and save as dataURL
            const SIZE = 300;           // output resolution in px
            const CANVAS_DISPLAY = 260; // must match CSS .crop-canvas-wrap width/height

            const canvas = document.createElement('canvas');
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext('2d');

            // Clip to circle
            ctx.beginPath();
            ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
            ctx.clip();

            const img = new Image();
            img.onload = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
                let baseW, baseH;
                if (ratio > 1) {
                    baseW = CANVAS_DISPLAY;
                    baseH = CANVAS_DISPLAY / ratio;
                } else {
                    baseH = CANVAS_DISPLAY;
                    baseW = CANVAS_DISPLAY * ratio;
                }

                const renderedW = baseW * this.cropModal.scale;
                const renderedH = baseH * this.cropModal.scale;
                const cx = CANVAS_DISPLAY / 2;
                const cy = CANVAS_DISPLAY / 2;
                const imgLeft = cx + this.cropModal.offsetX - renderedW / 2;
                const imgTop  = cy + this.cropModal.offsetY - renderedH / 2;
                const outputScale = SIZE / CANVAS_DISPLAY;

                ctx.drawImage(img, imgLeft * outputScale, imgTop * outputScale, renderedW * outputScale, renderedH * outputScale);

                this.profile.picture = canvas.toDataURL('image/jpeg', 0.9);
                this.profile.selectedAvatar = null;
                this.cropModal.visible = false;
                this.cropModal.src = null;
                this.markDirty();
            };
            img.src = this.cropModal.src;
        },

        saveProfile() {
            const users = JSON.parse(localStorage.getItem('hitster_users') || '[]');
            const idx = users.findIndex(u => u.id === this.currentUser.id);
            const updated = { ...this.currentUser, ...this.profile };
            if (idx !== -1) users[idx] = updated;
            localStorage.setItem('hitster_users', JSON.stringify(users));
            localStorage.setItem('hitster_session', JSON.stringify(updated));
            this.isDirty = false;
            this.justSaved = true;
            setTimeout(() => { this.justSaved = false; }, 2000);
        },

        logout() {
            localStorage.removeItem('hitster_session');
            this.$emit('logout');
        },
    }
};