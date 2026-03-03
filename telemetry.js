document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFCON Threat Gauge ---
    const threatGauge = document.getElementById('threat-gauge');
    const defconDisplay = document.getElementById('defcon-display');

    // Simulate threat analysis based on recent headlines
    // In a real app, this would be an API calculating sentiment/keywords
    function calculateThreatLevel() {
        const levels = [
            { level: 'DEFCON 5', color: '#00ccff', text: 'NORMAL READINESS' },
            { level: 'DEFCON 4', color: '#00ff00', text: 'INCREASED INTEL WATCH' },
            { level: 'DEFCON 3', color: '#ffff00', text: 'FORCE READINESS INCREASED' },
            { level: 'DEFCON 2', color: '#ff6600', text: 'NEXT STEP TO NUCLEAR WAR' },
            { level: 'DEFCON 1', color: '#ff0000', text: 'MAXIMUM READINESS' }
        ];

        // Randomly simulate between DEFCON 3, 2, or 1 for dramatic effect in demo
        const randomSpike = Math.floor(Math.random() * 3) + 2;
        const currentThreat = levels[randomSpike];

        defconDisplay.textContent = currentThreat.level;
        defconDisplay.style.color = currentThreat.color;
        defconDisplay.style.textShadow = `0 0 20px ${currentThreat.color}`;
        threatGauge.style.borderColor = currentThreat.color;
        threatGauge.style.boxShadow = `inset 0 0 50px ${currentThreat.color}22`;

        const subtitle = threatGauge.querySelector('h3');
        if (subtitle) subtitle.style.color = currentThreat.color;
    }

    // Initial calculation and periodic updates
    setTimeout(calculateThreatLevel, 1500);
    setInterval(calculateThreatLevel, 45000); // Recalculate every 45s

    // --- 1.5 AI Sentiment Index (Phase 5) ---
    const tensionBar = document.getElementById('tension-level');
    const tensionStatus = document.getElementById('tension-status-text');

    function calculateSentiment() {
        // Simulate an AI NLP analysis of current geopolitical news headlines
        const sentimentScore = Math.random() * 100; // 0 (Peace) to 100 (War)

        tensionBar.style.width = `${sentimentScore}%`;

        if (sentimentScore > 80) {
            tensionStatus.textContent = "CRITICAL: ESCALATORY RHETORIC DETECTED";
            tensionStatus.style.color = "var(--accent-red)";
        } else if (sentimentScore > 50) {
            tensionStatus.textContent = "ELEVATED CONCERN: NEGATIVE SENTIMENT";
            tensionStatus.style.color = "#ffaa00";
        } else {
            tensionStatus.textContent = "STABLE: DIPLOMATIC CHATTER NORMAL";
            tensionStatus.style.color = "#00ccff";
        }
    }
    setTimeout(calculateSentiment, 2000);
    setInterval(calculateSentiment, 30000); // Re-run AI analysis every 30s


    // --- 2. Market Impact Tickers ---
    const marketsContainer = document.getElementById('market-tickers');

    // Simulated market data (can be replaced with real API via Finnhub/Binance later)
    const marketData = [
        { symbol: 'CL=F', name: 'WTI Crude Oil', price: 82.45, change: 1.25, icon: 'droplet', up: true, url: 'https://finance.yahoo.com/quote/CL=F' },
        { symbol: 'GC=F', name: 'Gold Futures', price: 2354.10, change: 15.40, icon: 'gem', up: true, url: 'https://finance.yahoo.com/quote/GC=F' },
        { symbol: 'BTC-USD', name: 'Bitcoin', price: 64230.00, change: -850.50, icon: 'bitcoin', up: false, url: 'https://finance.yahoo.com/quote/BTC-USD' },
        { symbol: '^VIX', name: 'Volatility Index', price: 18.50, change: 2.15, icon: 'activity', up: true, url: 'https://finance.yahoo.com/quote/^VIX' }
    ];

    function renderMarkets() {
        marketData.forEach((m, index) => {
            // Simulate live jitter
            const jitter = (Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1));
            const newPrice = (m.price + jitter).toFixed(2);

            let item = marketsContainer.children[index];
            if (!item) {
                item = document.createElement('a');
                item.href = m.url;
                item.target = "_blank";
                item.className = 'market-item';
                item.innerHTML = `
                    <div class="market-info">
                        <div class="market-icon"><i data-lucide="${m.icon}"></i></div>
                        <div>
                            <div class="market-name">${m.name}</div>
                            <div class="market-ticker">${m.symbol}</div>
                        </div>
                    </div>
                    <div class="market-data">
                        <div class="market-price"></div>
                        <div class="market-change"></div>
                    </div>
                `;
                marketsContainer.appendChild(item);
                lucide.createIcons();
            }

            const priceEl = item.querySelector('.market-price');
            const changeEl = item.querySelector('.market-change');

            priceEl.textContent = `$${newPrice}`;
            changeEl.className = `market-change ${m.up ? 'change-up' : 'change-down'}`;
            changeEl.innerHTML = `
                ${m.up ? '+' : ''}${m.change}% 
                <i data-lucide="${m.up ? 'trending-up' : 'trending-down'}" style="width:12px;height:12px;"></i>
            `;
            // Only re-init icons for the change element to be efficient
            lucide.createIcons({ props: { "data-lucide": [m.up ? 'trending-up' : 'trending-down'] } });
        });
    }

    renderMarkets();
    setInterval(renderMarkets, 5000);


    // --- 3. Global Time Hub ---
    function updateClocks() {
        const now = new Date();

        // Tehran (UTC+3:30)
        let thr = new Date(now.getTime() + (3.5 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
        document.getElementById('time-thr').textContent = thr.toISOString().substring(11, 19);

        // Washington DC (UTC-4/-5 - approx local)
        let dcOpts = { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        document.getElementById('time-dc').textContent = now.toLocaleTimeString('en-US', dcOpts);

        // ZULU / UTC
        document.getElementById('time-utc').textContent = now.toISOString().substring(11, 19);
    }
    setInterval(updateClocks, 1000);
    updateClocks();


    // --- 4. Interactive Target Dossiers (Phase 5) ---
    const dossierPanel = document.getElementById('dossier-panel');
    const closeDossierBtn = document.getElementById('close-dossier');

    if (closeDossierBtn) {
        closeDossierBtn.addEventListener('click', () => {
            dossierPanel.classList.remove('active');
        });
    }

    window.openDossier = function (data) {
        if (!dossierPanel) return;
        document.getElementById('dossier-title').textContent = data.name;
        document.getElementById('dossier-threat').textContent = data.threat;
        document.getElementById('dossier-coords').textContent = `${data.lat} N, ${data.lon} E`;
        document.getElementById('dossier-desc').textContent = data.desc;

        const activityList = document.getElementById('dossier-activity');
        if (activityList) {
            activityList.innerHTML = '';
            data.activity.forEach(act => {
                const li = document.createElement('li');
                li.textContent = act;
                activityList.appendChild(li);
            });
        }

        const threatSpan = document.getElementById('dossier-threat');
        if (threatSpan) {
            threatSpan.className = '';
            if (data.threat === 'CRITICAL') threatSpan.classList.add('accent-red');
            else if (data.threat === 'SEVERE') threatSpan.style.color = '#ffaa00';
            else threatSpan.classList.add('accent-blue');
        }

        dossierPanel.classList.add('active');
    };

    // --- 5. Global Terminal Logger ---
    const terminalLog = document.getElementById('terminal-log');
    window.addTerminalLog = function (message, isAlert = false) {
        if (!terminalLog) return;
        const p = document.createElement('div');
        p.className = `log-line ${isAlert ? 'alert-msg' : ''}`;
        const time = new Date().toISOString().substring(11, 19);
        p.textContent = `[${time}] ${message}`;
        terminalLog.appendChild(p);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    };
});
