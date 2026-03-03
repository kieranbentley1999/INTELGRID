/**
 * SIGINT HUB: Live Signals Intelligence Audio & Visualizer
 * Handles real-world ATC relays and tactical shortwave streams.
 */

class SigintHub {
    constructor() {
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        this.currentAudio = null;
        this.canvas = document.getElementById('oscilloscope');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.channels = [
            { id: 'ch1', name: 'GLOBAL AIR RELAY', freq: '121.500 MHz', url: 'https://s1-fmt2.liveatc.net/egll_app_dep' }, // London Heathrow Relay (Stable)
            { id: 'ch2', name: 'TACTICAL HF LOOP', freq: '4.625 MHz', url: 'https://stream.broadcastify.com/39341' }, // Tactical/Military Monitor
            { id: 'ch3', name: 'THEATER MONITOR', freq: '118.100 MHz', url: 'https://s1-fmt2.liveatc.net/othh_twr' }   // Doha Tower (Regional)
        ];

        this.activeIndex = 0;
        this.isTuning = false;
    }

    init(audioContext) {
        if (!this.ctx || !audioContext) return;

        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.drawOverlay();
    }

    async setChannel(index) {
        if (this.isTuning) return;
        this.isTuning = true;
        this.activeIndex = index;

        // Update UI
        const channel = this.channels[index];
        document.getElementById('sigint-name').textContent = channel.name;
        document.getElementById('sigint-freq').textContent = channel.freq;

        // Play Tuning Sound (Simulated via AudioAmbience or just static)
        this.stopCurrent();

        // Initialize New Audio
        this.currentAudio = new Audio(channel.url);
        this.currentAudio.crossOrigin = "anonymous";

        try {
            const source = window.ambience.ctx.createMediaElementSource(this.currentAudio);
            source.connect(this.analyser);
            this.analyser.connect(window.ambience.ctx.destination);

            await this.currentAudio.play();
            this.startVisualizer();
        } catch (e) {
            console.error("SIGINT Stream failed:", e);
        } finally {
            this.isTuning = false;
        }
    }

    stopCurrent() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    startVisualizer() {
        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            this.analyser.getByteTimeDomainData(this.dataArray);

            this.ctx.fillStyle = 'rgba(5, 6, 8, 0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#00f2ff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00f2ff';

            this.ctx.beginPath();
            let sliceWidth = this.canvas.width * 1.0 / this.analyser.frequencyBinCount;
            let x = 0;

            for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                let v = this.dataArray[i] / 128.0;
                let y = v * this.canvas.height / 2;

                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);

                x += sliceWidth;
            }

            this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
            this.ctx.stroke();

            this.drawOverlay();
        };
        draw();
    }

    drawOverlay() {
        // Draw grid lines for the CRT look
        this.ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 0;

        for (let i = 0; i < this.canvas.width; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let j = 0; j < this.canvas.height; j += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j);
            this.ctx.lineTo(this.canvas.width, j);
            this.ctx.stroke();
        }
    }
}

window.SigintHub = new SigintHub();

document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('sigint-prev');
    const nextBtn = document.getElementById('sigint-next');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            let next = window.SigintHub.activeIndex - 1;
            if (next < 0) next = window.SigintHub.channels.length - 1;
            window.SigintHub.setChannel(next);
        });

        nextBtn.addEventListener('click', () => {
            let next = (window.SigintHub.activeIndex + 1) % window.SigintHub.channels.length;
            window.SigintHub.setChannel(next);
        });
    }
});
