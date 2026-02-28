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


    // --- 2. Market Impact Tickers ---
    const marketsContainer = document.getElementById('market-tickers');

    // Simulated market data (can be replaced with real API via Finnhub/Binance later)
    const marketData = [
        { symbol: 'CL=F', name: 'WTI Crude Oil', price: 82.45, change: 1.25, icon: 'droplet', up: true },
        { symbol: 'GC=F', name: 'Gold Futures', price: 2354.10, change: 15.40, icon: 'gem', up: true },
        { symbol: 'BTC-USD', name: 'Bitcoin', price: 64230.00, change: -850.50, icon: 'bitcoin', up: false },
        { symbol: '^VIX', name: 'Volatility Index', price: 18.50, change: 2.15, icon: 'activity', up: true }
    ];

    function renderMarkets() {
        marketsContainer.innerHTML = '';
        marketData.forEach(m => {
            // Simulate live jitter
            const jitter = (Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1));
            const newPrice = (m.price + jitter).toFixed(2);

            const item = document.createElement('div');
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
                    <div class="market-price">$${newPrice}</div>
                    <div class="market-change ${m.up ? 'change-up' : 'change-down'}">
                        ${m.up ? '+' : ''}${m.change}% 
                        <i data-lucide="${m.up ? 'trending-up' : 'trending-down'}" style="width:12px;height:12px;"></i>
                    </div>
                </div>
            `;
            marketsContainer.appendChild(item);
        });
        lucide.createIcons();
    }

    renderMarkets();
    setInterval(renderMarkets, 5000); // Jitter prices every 5 seconds


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


    // --- 4. Interactive Threat Map (D3 + TopoJSON + Live USGS Seismic Data) ---
    const mapContainer = document.getElementById('threat-map-container');
    const width = mapContainer.clientWidth;
    const height = 300;

    const svg = d3.select("#threat-map-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Zoom into Middle East region
    const projection = d3.geoMercator()
        .scale(400)
        .center([45, 30]) // Middle East Center (Long, Lat)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load GeoJSON Map Data
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (topo) {

        // Draw Map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            .attr("class", d => {
                if (d.id === "IRN") return "land country-iran";
                if (d.id === "USA") return "land country-usa";
                return "land";
            })
            .attr("d", path);

        // Fixed Hotspots (Existing)
        const hotspots = [
            { lon: 51.38, lat: 35.68, name: "Tehran Target Alpha" },
            { lon: 56.46, lat: 26.56, name: "Hormuz Chokepoint" },
            { lon: 44.38, lat: 33.31, name: "Baghdad Green Zone" }
        ];

        // Draw Base Hotspots
        const hotspotLayer = svg.append("g");

        hotspotLayer.selectAll(".pulse-ring")
            .data(hotspots)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.lon, d.lat])[0])
            .attr("cy", d => projection([d.lon, d.lat])[1])
            .attr("r", 5)
            .attr("class", "pulse-ring")
            .style("animation-delay", (d, i) => `${i * 0.5}s`);

        hotspotLayer.selectAll(".hotspot-center")
            .data(hotspots)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.lon, d.lat])[0])
            .attr("cy", d => projection([d.lon, d.lat])[1])
            .attr("r", 3)
            .style("fill", "var(--accent-red)");

        // Initialize Live USGS Seismic Data feed
        initSeismicFeed(svg, projection);

    }).catch(err => {
        console.error("Error loading map GeoJSON:", err);
        mapContainer.innerHTML = "<p style='color:red; text-align:center; padding-top:20px;'>Failed to connect to satellite imagery.</p>";
    });

    // --- 5. USGS Seismic "Anomaly" Tracker & Terminal Log ---
    const terminalLog = document.getElementById('terminal-log');
    let knownAnomalies = new Set();

    function addTerminalLog(message, isAlert = false) {
        const p = document.createElement('div');
        p.className = `log-line ${isAlert ? 'alert-msg' : ''}`;
        const time = new Date().toISOString().substring(11, 19);
        p.textContent = `[${time}] ${message}`;
        terminalLog.appendChild(p);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    function initSeismicFeed(svgMap, mapProjection) {
        addTerminalLog("> Uplink to USGS Global Seismic Array established.");
        fetchAnomalies();
        setInterval(fetchAnomalies, 60000); // Check every minute

        function fetchAnomalies() {
            // Fetch all earthquakes from USGS in the past day
            const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

            fetch(USGS_URL)
                .then(res => res.json())
                .then(data => {
                    const features = data.features;
                    let newAnomaliesCount = 0;

                    features.forEach(eq => {
                        const coords = eq.geometry.coordinates; // [lon, lat, depth]
                        const lon = coords[0];
                        const lat = coords[1];
                        const mag = eq.properties.mag;
                        const id = eq.id;

                        // Filter for "Middle East Theater" roughly (Long: 34 to 63, Lat: 12 to 42)
                        const inTheater = (lon >= 34 && lon <= 63 && lat >= 12 && lat <= 42);

                        if (inTheater && !knownAnomalies.has(id)) {
                            knownAnomalies.add(id);
                            newAnomaliesCount++;

                            // 1. Log to Terminal
                            addTerminalLog(`ANOMALY DETECTED: Magnitude ${mag.toFixed(1)} kinetic signature at ${eq.properties.place.toUpperCase()}.`, true);

                            // 2. Plot on D3 Map
                            const projected = mapProjection([lon, lat]);
                            if (projected) {
                                // Add pulsating ring
                                svgMap.append("circle")
                                    .attr("cx", projected[0])
                                    .attr("cy", projected[1])
                                    .attr("r", 1)
                                    .attr("class", "anomaly-ring")
                                    .style("animation-delay", "0s");

                                // Add center dot
                                svgMap.append("circle")
                                    .attr("cx", projected[0])
                                    .attr("cy", projected[1])
                                    .attr("r", Math.max(2, mag))
                                    .style("fill", "#ffaa00");
                            }
                        }
                    });

                    if (newAnomaliesCount === 0 && knownAnomalies.size > 0) {
                        // Just random chatter so the terminal feels alive
                        if (Math.random() > 0.5) {
                            addTerminalLog("> Area Sector scan complete. No new kinetic signatures in theater.");
                        } else {
                            addTerminalLog("> OSINT nodes synchronizing...");
                        }
                    }
                })
                .catch(err => console.error("USGS Feed Error: ", err));
        }
    }
});
