window.EscalationEngine = {
    currentLevel: 45,
    keywords: {
        'strike': 15, 'war': 25, 'nuclear': 50, 'breach': 10, 'attack': 15, 'critical': 10,
        'missile': 20, 'casualty': 15, 'vulnerability': 5, 'exploit': 5
    },

    init: function () {
        this.updateUI();
        // Natural cooldown
        setInterval(() => {
            if (this.currentLevel > 20) {
                this.currentLevel -= 1;
                this.updateUI();
            }
        }, 5000);
    },

    analyze: function (text) {
        let added = 0;
        const lower = text.toLowerCase();

        for (const [word, weight] of Object.entries(this.keywords)) {
            if (lower.includes(word)) added += weight;
        }

        if (added > 0) {
            this.currentLevel = Math.min(100, this.currentLevel + added);
            this.updateUI();

            // If it's a major spike, trigger a red alert flash on the body
            if (added >= 15) {
                document.body.classList.add('red-alert');
                setTimeout(() => document.body.classList.remove('red-alert'), 1000);
            }
        }
    },

    updateUI: function () {
        const display = document.getElementById('defcon-display');
        const gauge = document.getElementById('threat-gauge');
        if (!display || !gauge) return;

        // Count up animation
        const target = this.currentLevel;
        let current = parseInt(display.innerText) || 0;

        const animate = setInterval(() => {
            if (current == target) clearInterval(animate);
            else {
                current += (target > current) ? 1 : -1;
                display.innerText = current;
            }
        }, 50);

        // Update colors based on severity
        if (target >= 80) {
            gauge.style.borderColor = 'var(--danger)';
            display.style.color = 'var(--danger)';
            gauge.style.boxShadow = '0 0 30px rgba(255,51,102,0.6)';
        } else if (target >= 50) {
            gauge.style.borderColor = '#ffaa00';
            display.style.color = '#ffaa00';
            gauge.style.boxShadow = '0 0 20px rgba(255,170,0,0.4)';
        } else {
            gauge.style.borderColor = 'var(--accent-blue)';
            display.style.color = 'var(--accent-blue)';
            gauge.style.boxShadow = '0 0 20px rgba(0,212,255,0.2)';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.EscalationEngine.init();
});
