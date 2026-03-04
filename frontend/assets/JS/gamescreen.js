const gameScreen = {
    emits: ['back'],
    template: `
    <div class="game-screen">

        <!-- TOP BAR -->
        <div class="top-bar">
            <button class="back-btn" @click="$emit('back')">← HOME</button>
            <div class="score-display">
                <span class="score-label">SCORE</span>
                <span class="score-value">{{ score }}</span>
            </div>
        </div>

        <!-- ACTIVE CARD AREA -->
        <div class="card-area" v-if="!gameOver">
            <div class="active-card" :class="{ 'is-playing': isPlaying, 'revealed': currentRevealed }">
                <div class="card-inner">
                    <div class="card-mystery" v-if="!currentRevealed">
                        <div class="vinyl-icon">🎵</div>
                        <p class="card-hint">Drag to your timeline when you know it!</p>
                    </div>
                    <div class="card-revealed" v-else>
                        <div class="card-year-big">{{ currentSong.year }}</div>
                        <div class="card-title">{{ currentSong.title }}</div>
                        <div class="card-artist">{{ currentSong.artist }}</div>
                    </div>
                </div>

                <!-- PLAY BUTTON -->
                <button class="play-btn" @click="togglePlay" :class="{ playing: isPlaying }">
                    <span v-if="!isPlaying">▶ PLAY</span>
                    <span v-else>⏸ {{ timeLeft }}s</span>
                </button>
            </div>

            <!-- DRAG TARGET INSTRUCTION -->
            <p class="drag-hint" v-if="isPlaying || timeLeft < 30">
                ↓ Drag the card into the correct spot in your timeline ↓
            </p>
        </div>

        <!-- GAME OVER STATE -->
        <div class="game-over-area" v-if="gameOver">
            <div class="game-over-card">
                <div class="game-over-label">GAME OVER</div>
                <div class="game-over-score">{{ score }}</div>
                <div class="game-over-sub">songs placed correctly</div>
                <div class="game-over-wrong">
                    <span class="wrong-song">✗ {{ lastWrongSong.title }} ({{ lastWrongSong.year }}) — you placed it {{ wrongPlacementMsg }}</span>
                </div>
                <button class="restart-btn" @click="restartGame">PLAY AGAIN</button>
            </div>
        </div>

        <!-- TIMELINE -->
        <div class="timeline-wrapper">
            <div class="timeline-label">YOUR TIMELINE</div>
            <div class="timeline-track">

                <!-- Drop zone BEFORE first card -->
                <div
                    class="drop-zone"
                    :class="{ 'drag-over': dragOverIndex === 0 }"
                    @dragover.prevent="dragOverIndex = 0"
                    @dragleave="dragOverIndex = null"
                    @drop="dropCard(0)"
                ></div>

                <template v-for="(card, index) in timeline" :key="card.id">
                    <div class="timeline-card">
                        <div class="tl-year">{{ card.year }}</div>
                        <div class="tl-title">{{ card.title }}</div>
                        <div class="tl-artist">{{ card.artist }}</div>
                    </div>

                    <!-- Drop zone AFTER each card -->
                    <div
                        class="drop-zone"
                        :class="{ 'drag-over': dragOverIndex === index + 1 }"
                        @dragover.prevent="dragOverIndex = index + 1"
                        @dragleave="dragOverIndex = null"
                        @drop="dropCard(index + 1)"
                    ></div>
                </template>

                <!-- Empty state -->
                <div class="timeline-empty" v-if="timeline.length === 0">
                    Drop your first card here after playing!
                </div>
            </div>

            <!-- Draggable ghost card (only active while playing) -->
            <div
                class="draggable-card"
                v-if="(isPlaying || timeLeft < 30) && !gameOver && !currentRevealed"
                draggable="true"
                @dragstart="onDragStart"
                @dragend="onDragEnd"
                :class="{ dragging: isDragging }"
            >
                <div class="drag-icon">🎵</div>
                <div class="drag-label">DRAG ME</div>
            </div>
        </div>

    </div>
    `,

    data() {
        return {
            score: 0,
            isPlaying: false,
            isDragging: false,
            dragOverIndex: null,
            currentRevealed: false,
            gameOver: false,
            lastWrongSong: {},
            wrongPlacementMsg: '',
            timeLeft: 30,
            timer: null,
            songIndex: 0,

            timeline: [],

            // Fake song data — sorted by year so we can check correctness
            songs: [
                { id: 1,  title: 'Johnny B. Goode',        artist: 'Chuck Berry',          year: 1958 },
                { id: 2,  title: 'Hey Jude',               artist: 'The Beatles',           year: 1968 },
                { id: 3,  title: 'Bohemian Rhapsody',      artist: 'Queen',                 year: 1975 },
                { id: 4,  title: 'Billie Jean',            artist: 'Michael Jackson',       year: 1983 },
                { id: 5,  title: 'Smells Like Teen Spirit',artist: 'Nirvana',               year: 1991 },
                { id: 6,  title: 'Wonderwall',             artist: 'Oasis',                 year: 1995 },
                { id: 7,  title: 'Crazy In Love',          artist: 'Beyoncé',               year: 2003 },
                { id: 8,  title: 'Umbrella',               artist: 'Rihanna',               year: 2007 },
                { id: 9,  title: 'Rolling in the Deep',    artist: 'Adele',                 year: 2010 },
                { id: 10, title: 'Blinding Lights',        artist: 'The Weeknd',            year: 2019 },
                { id: 11, title: 'As It Was',              artist: 'Harry Styles',          year: 2022 },
                { id: 12, title: 'Flowers',                artist: 'Miley Cyrus',           year: 2023 },
            ],

            shuffledSongs: [],
        };
    },

    computed: {
        currentSong() {
            return this.shuffledSongs[this.songIndex] || {};
        }
    },

    created() {
        this.shuffledSongs = [...this.songs].sort(() => Math.random() - 0.5);
        // Give 1 starter card on the timeline
        const starter = this.shuffledSongs[this.shuffledSongs.length - 1];
        this.timeline.push(starter);
        this.shuffledSongs.pop();
    },

    methods: {
        togglePlay() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.timeLeft = 30;
            this.timer = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.isPlaying = false;
                }
            }, 1000);
        },

        onDragStart(e) {
            this.isDragging = true;
            e.dataTransfer.effectAllowed = 'move';
        },

        onDragEnd() {
            this.isDragging = false;
            this.dragOverIndex = null;
        },

        dropCard(insertIndex) {
            clearInterval(this.timer);
            this.isPlaying = false;
            this.isDragging = false;
            this.dragOverIndex = null;
            this.currentRevealed = true;

            const song = this.currentSong;

            // Check correctness: is the year in the right spot?
            const correct = this.isCorrectPlacement(song.year, insertIndex);

            if (correct) {
                // Insert into timeline at the right position
                this.timeline.splice(insertIndex, 0, { ...song });
                this.score++;

                // After a short reveal delay, load next song
                setTimeout(() => {
                    this.currentRevealed = false;
                    this.songIndex++;
                    this.timeLeft = 30;
                    if (this.songIndex >= this.shuffledSongs.length) {
                        // Out of songs — winner!
                        this.gameOver = true;
                    }
                }, 1800);
            } else {
                // Wrong — reveal then game over
                this.lastWrongSong = song;
                const before = this.timeline[insertIndex - 1];
                const after  = this.timeline[insertIndex];
                if (before && after) {
                    this.wrongPlacementMsg = `between ${before.year} and ${after.year}`;
                } else if (before) {
                    this.wrongPlacementMsg = `after ${before.year}`;
                } else if (after) {
                    this.wrongPlacementMsg = `before ${after.year}`;
                } else {
                    this.wrongPlacementMsg = 'incorrectly';
                }

                setTimeout(() => {
                    this.gameOver = true;
                }, 1800);
            }
        },

        isCorrectPlacement(year, insertIndex) {
            const before = this.timeline[insertIndex - 1];
            const after  = this.timeline[insertIndex];
            const afterOk  = !after  || year <= after.year;
            const beforeOk = !before || year >= before.year;
            return beforeOk && afterOk;
        },

        restartGame() {
            this.score = 0;
            this.songIndex = 0;
            this.timeline = [];
            this.gameOver = false;
            this.currentRevealed = false;
            this.isPlaying = false;
            this.timeLeft = 30;
            this.shuffledSongs = [...this.songs].sort(() => Math.random() - 0.5);
            const starter = this.shuffledSongs[this.shuffledSongs.length - 1];
            this.timeline.push(starter);
            this.shuffledSongs.pop();
        }
    }
};