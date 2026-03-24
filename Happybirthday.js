const text = "Happy Birthday, Riddhi ✨";
const titleEl = document.getElementById("title");
const overlayEl = document.getElementById("startOverlay");
const containerEl = document.querySelector(".container");
const cakeEl = document.getElementById("cake");
const candleWrapEl = document.querySelector(".candle-wrap");
const hintEl = document.getElementById("hint");
const relightBtn = document.getElementById("relightBtn");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const burstBtn = document.getElementById("burstBtn");
const backBtn = document.getElementById("backBtn");

let typeIndex = 0;
let celebrationStarted = false;
let candleBlown = false;
let audioCtx;
let masterGainNode;
let musicLoopTimer;
let isMusicPlaying = false;
const MUSIC_VOLUME = 0.7;

const birthdayMelody = [
    { note: 392.0, beat: 1 },
    { note: 392.0, beat: 1 },
    { note: 440.0, beat: 2 },
    { note: 392.0, beat: 2 },
    { note: 523.25, beat: 2 },
    { note: 493.88, beat: 4 },
    { note: 392.0, beat: 1 },
    { note: 392.0, beat: 1 },
    { note: 440.0, beat: 2 },
    { note: 392.0, beat: 2 },
    { note: 587.33, beat: 2 },
    { note: 523.25, beat: 4 },
    { note: 392.0, beat: 1 },
    { note: 392.0, beat: 1 },
    { note: 783.99, beat: 2 },
    { note: 659.25, beat: 2 },
    { note: 523.25, beat: 2 },
    { note: 493.88, beat: 2 },
    { note: 440.0, beat: 4 },
    { note: 698.46, beat: 1 },
    { note: 698.46, beat: 1 },
    { note: 659.25, beat: 2 },
    { note: 523.25, beat: 2 },
    { note: 587.33, beat: 2 },
    { note: 523.25, beat: 4 }
];

overlayEl.addEventListener("click", startCelebration);
cakeEl.addEventListener("click", blowCandle);
cakeEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        blowCandle();
    }
});
relightBtn.addEventListener("click", relightCandle);
musicToggleBtn.addEventListener("click", toggleMusic);
burstBtn.addEventListener("click", () => createConfetti(100));
backBtn.addEventListener("click", backToStart);

function startCelebration() {
    if (celebrationStarted) {
        return;
    }

    celebrationStarted = true;
    overlayEl.classList.add("hidden");
    containerEl.classList.remove("hidden");
    containerEl.classList.add("reveal");
    typeEffect();
    createConfetti(120);
}

function typeEffect() {
    titleEl.textContent = "";
    typeIndex = 0;

    const writer = () => {
        if (typeIndex < text.length) {
            titleEl.textContent += text.charAt(typeIndex);
            typeIndex += 1;
            setTimeout(writer, 65);
        }
    };

    writer();
}

function blowCandle() {
    if (!celebrationStarted || candleBlown) {
        return;
    }

    candleBlown = true;
    candleWrapEl.classList.add("is-blown");
    hintEl.textContent = "Make a wish, birthday queen ✨";
    createConfetti(160);
}

function relightCandle() {
    if (!celebrationStarted) {
        return;
    }

    candleBlown = false;
    candleWrapEl.classList.remove("is-blown");
    hintEl.textContent = "Click the cake to blow the candle 🎂";
}

function backToStart() {
    celebrationStarted = false;
    candleBlown = false;
    typeIndex = 0;

    titleEl.textContent = "";
    hintEl.textContent = "Click the cake to blow the candle 🎂";
    candleWrapEl.classList.remove("is-blown");

    containerEl.classList.add("hidden");
    containerEl.classList.remove("reveal");
    overlayEl.classList.remove("hidden");
    stopMusic();

    document.querySelectorAll(".confetti").forEach((piece) => piece.remove());
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGainNode = audioCtx.createGain();
        masterGainNode.gain.value = MUSIC_VOLUME;
        masterGainNode.connect(audioCtx.destination);
    }

    return audioCtx;
}

function playNote(frequency, startTime, duration) {
    const context = getAudioContext();
    const leadOsc = context.createOscillator();
    const harmonyOsc = context.createOscillator();
    const leadGain = context.createGain();
    const harmonyGain = context.createGain();

    leadOsc.type = "sine";
    harmonyOsc.type = "triangle";
    leadOsc.frequency.setValueAtTime(frequency, startTime);
    harmonyOsc.frequency.setValueAtTime(frequency * 1.5, startTime);

    leadGain.gain.setValueAtTime(0.0001, startTime);
    leadGain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.03);
    leadGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    harmonyGain.gain.setValueAtTime(0.0001, startTime);
    harmonyGain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.03);
    harmonyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    leadOsc.connect(leadGain);
    harmonyOsc.connect(harmonyGain);
    leadGain.connect(masterGainNode);
    harmonyGain.connect(masterGainNode);

    leadOsc.start(startTime);
    harmonyOsc.start(startTime);
    leadOsc.stop(startTime + duration + 0.02);
    harmonyOsc.stop(startTime + duration + 0.02);
}

function scheduleBirthdayMelody() {
    const context = getAudioContext();
    const beatSeconds = 0.26;
    let cursor = context.currentTime + 0.04;

    birthdayMelody.forEach(({ note, beat }) => {
        const duration = beat * beatSeconds;
        playNote(note, cursor, duration * 0.92);
        cursor += duration;
    });

    const loopDurationMs = (cursor - context.currentTime) * 1000;
    musicLoopTimer = window.setTimeout(() => {
        if (isMusicPlaying) {
            scheduleBirthdayMelody();
        }
    }, loopDurationMs);
}

async function startMusic() {
    if (isMusicPlaying) {
        return;
    }

    const context = getAudioContext();

    if (context.state === "suspended") {
        try {
            await context.resume();
        } catch {
            return;
        }
    }

    isMusicPlaying = true;
    syncMusicButton();
    scheduleBirthdayMelody();
}

function stopMusic() {
    isMusicPlaying = false;

    if (musicLoopTimer) {
        window.clearTimeout(musicLoopTimer);
        musicLoopTimer = undefined;
    }

    if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
    }

    audioCtx = undefined;
    masterGainNode = undefined;
    syncMusicButton();
}

function toggleMusic() {
    if (isMusicPlaying) {
        stopMusic();
        return;
    }

    startMusic();
}

function syncMusicButton() {
    musicToggleBtn.textContent = isMusicPlaying ? "Pause Music" : "Play Music";
}

function tryAutoStartMusic() {
    if (!isMusicPlaying) {
        startMusic();
    }
}

function installAutoStartFallback() {
    const tryStartFromGesture = () => {
        if (!isMusicPlaying) {
            startMusic();
        }

        window.removeEventListener("pointerdown", tryStartFromGesture);
        window.removeEventListener("touchstart", tryStartFromGesture);
        window.removeEventListener("mousedown", tryStartFromGesture);
        window.removeEventListener("click", tryStartFromGesture);
        window.removeEventListener("keydown", tryStartFromGesture);
    };

    window.addEventListener("pointerdown", tryStartFromGesture, { once: true });
    window.addEventListener("touchstart", tryStartFromGesture, { once: true });
    window.addEventListener("mousedown", tryStartFromGesture, { once: true });
    window.addEventListener("click", tryStartFromGesture, { once: true });
    window.addEventListener("keydown", tryStartFromGesture, { once: true });
}

syncMusicButton();
tryAutoStartMusic();
window.addEventListener("load", tryAutoStartMusic, { once: true });
window.addEventListener("pageshow", tryAutoStartMusic);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        tryAutoStartMusic();
    }
});
installAutoStartFallback();

function createConfetti(count = 80) {
    for (let idx = 0; idx < count; idx += 1) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.background = randomColor();
        confetti.style.opacity = `${Math.random() * 0.5 + 0.5}`;
        confetti.style.animationDuration = `${Math.random() * 2.8 + 2.4}s`;
        confetti.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5600);
    }
}

function randomColor() {
    const colors = ["#f472b6", "#fb7185", "#f9a8d4", "#fef3c7", "#fde68a", "#ffffff"];
    return colors[Math.floor(Math.random() * colors.length)];
}