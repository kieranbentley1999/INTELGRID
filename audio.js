/**
 * Audio Synthesis for INTELGRID War Room Ambience
 * Uses Web Audio API to procedurally generate low-frequency drones and sonar pings.
 */

class AudioAmbience {
    constructor() {
        this.baseFreq = 50; // Deep low hum
        this.ctx = null;
        this.droneOscillator = null;
        this.droneGain = null;
        this.pingInterval = null;
        this.isPlaying = false;
    }

    async init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    startDrone() {
        // Deep Drone
        this.droneOscillator = this.ctx.createOscillator();
        this.droneOscillator.type = 'sawtooth';
        this.droneOscillator.frequency.value = this.baseFreq;

        // Sub Drone for thickness
        this.subOscillator = this.ctx.createOscillator();
        this.subOscillator.type = 'sine';
        this.subOscillator.frequency.value = this.baseFreq / 2;

        // Lowpass Filter to muffle it into a rumble
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 150;

        // Master Gain
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.3; // Gentle volume

        // Connect
        this.droneOscillator.connect(this.filter);
        this.subOscillator.connect(this.filter);
        this.filter.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);

        this.droneOscillator.start();
        this.subOscillator.start();

        // Slow LFO on the filter for a "breathing" effect
        this.lfo = this.ctx.createOscillator();
        this.lfo.type = 'sine';
        this.lfo.frequency.value = 0.1; // 10 seconds per cycle
        this.lfoGain = this.ctx.createGain();
        this.lfoGain.gain.value = 50;
        this.lfo.connect(this.lfoGain);
        this.lfoGain.connect(this.filter.frequency);
        this.lfo.start();
    }

    playSonarPing() {
        if (!this.isPlaying) return;

        const pingOsc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();

        // Classic high-pitched sonar ping
        pingOsc.type = 'sine';
        pingOsc.frequency.setValueAtTime(800, this.ctx.currentTime);
        pingOsc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.1);

        // Sharp attack, long delayed decay
        pingGain.gain.setValueAtTime(0, this.ctx.currentTime);
        pingGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.05);
        pingGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

        // Add some reverb/delay illusion using a simple feedback delay
        const delay = this.ctx.createDelay();
        delay.delayTime.value = 0.4;
        const feedback = this.ctx.createGain();
        feedback.gain.value = 0.3;

        pingOsc.connect(pingGain);
        pingGain.connect(this.ctx.destination);
        pingGain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(this.ctx.destination);

        pingOsc.start();
        pingOsc.stop(this.ctx.currentTime + 3);

        // Schedule next ping randomly between 5 and 15 seconds
        if (this.isPlaying) {
            const nextPing = Math.random() * 10000 + 5000;
            this.pingInterval = setTimeout(() => this.playSonarPing(), nextPing);
        }
    }

    start() {
        this.isPlaying = true;
        this.startDrone();
        // Start first ping slightly delayed
        this.pingInterval = setTimeout(() => this.playSonarPing(), 2000);
    }

    stop() {
        this.isPlaying = false;

        if (this.droneOscillator) {
            // Fade out smoothly
            this.droneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
            setTimeout(() => {
                this.droneOscillator.stop();
                this.subOscillator.stop();
                this.lfo.stop();
                this.droneOscillator.disconnect();
                this.subOscillator.disconnect();
                this.lfo.disconnect();
            }, 1000);
        }

        if (this.pingInterval) {
            clearTimeout(this.pingInterval);
        }
    }
}

// UI Binding
document.addEventListener('DOMContentLoaded', () => {
    const audioToggle = document.getElementById('audio-toggle');
    const audioStatus = document.getElementById('audio-status');
    const iconSpan = audioToggle.querySelector('i');

    let ambience = null;

    audioToggle.addEventListener('click', async () => {
        if (!ambience) {
            ambience = new AudioAmbience();
            await ambience.init();
        }

        if (ambience.isPlaying) {
            ambience.stop();
            audioStatus.textContent = 'AMBIENCE: OFF';
            iconSpan.setAttribute('data-lucide', 'volume-x');
            audioToggle.classList.remove('active');
        } else {
            await ambience.init(); // ensure context is resumed
            ambience.start();
            audioStatus.textContent = 'AMBIENCE: ON';
            iconSpan.setAttribute('data-lucide', 'volume-2');
            audioToggle.classList.add('active');
        }

        // Re-render the icon
        lucide.createIcons({
            nameAttr: 'data-lucide',
            icons: {
                VolumeX: lucide.icons.VolumeX,
                Volume2: lucide.icons.Volume2
            }
        });
    });
});
