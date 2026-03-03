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
        marketsContainer.innerHTML = '';
        marketData.forEach(m => {
            // Simulate live jitter
            const jitter = (Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1));
            const newPrice = (m.price + jitter).toFixed(2);

            const item = document.createElement('a');
            item.href = m.url;
            item.target = "_blank";
            item.className = 'market-item';
            item.style.textDecoration = 'none';
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
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

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

        // Interactive Hotspots (Phase 5)
        const hotspots = [
            {
                lon: 51.38, lat: 35.68,
                name: "Tehran Command Center",
                threat: "CRITICAL",
                desc: "Primary command and control nodes for IRGC operations. High concentration of retaliatory assets and political leadership.",
                activity: ["> Secure comms intercept: Volume increased 400%", "> Multiple high-ranking transits detected"]
            },
            {
                lon: 56.46, lat: 26.56,
                name: "Strait of Hormuz",
                threat: "SEVERE",
                desc: "Strategic maritime chokepoint. 20% of global oil transit. High risk of naval mining or fast-attack craft swarm tactics.",
                activity: ["> Fast-attack craft maneuvering observed", "> Radar ping: Undisclosed submarine signature"]
            },
            {
                lon: 44.38, lat: 33.31,
                name: "Baghdad Green Zone",
                threat: "ELEVATED",
                desc: "US Embassy and coalition forces hub. Frequent target for proxy militia indirect fire (rocket/drone) attacks.",
                activity: ["> C-RAM defense systems active", "> Proxy militia chatter spike"]
            },
            {
                lon: 34.78, lat: 32.08,
                name: "Tel Aviv Intel Hub",
                threat: "HIGH",
                desc: "Primary regional allied intelligence sharing node. Under continuous high-alert for ballistic missile interception.",
                activity: ["> Iron Dome batteries redeployed", "> GPS spoofing active in sector"]
            }
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
            .style("animation-delay", (d, i) => `${i * 0.5}s`)
            .style("cursor", "crosshair")
            .on("click", (event, d) => openDossier(d));

        hotspotLayer.selectAll(".hotspot-center")
            .data(hotspots)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.lon, d.lat])[0])
            .attr("cy", d => projection([d.lon, d.lat])[1])
            .attr("r", 3)
            .style("fill", "var(--accent-red)")
            .style("cursor", "crosshair")
            .on("click", (event, d) => openDossier(d));

        // Initialize Live USGS Seismic Data feed
        initSeismicFeed(svg, projection);

        // Initialize Live OpenSky Flight Tracker (Phase 5)
        initFlightTracker(svg, projection);

    }).catch(err => {
        console.error("Error loading map GeoJSON:", err);
        mapContainer.innerHTML = "<p style='color:red; text-align:center; padding-top:20px;'>Failed to connect to satellite imagery.</p>";
    });

    // --- Phase 5: Interactive Target Dossiers ---
    const dossierPanel = document.getElementById('dossier-panel');
    const closeDossierBtn = document.getElementById('close-dossier');

    closeDossierBtn.addEventListener('click', () => {
        dossierPanel.classList.remove('active');
    });

    // Make it global so the click handler works
    window.openDossier = function (data) {
        document.getElementById('dossier-title').textContent = data.name;
        document.getElementById('dossier-threat').textContent = data.threat;
        document.getElementById('dossier-coords').textContent = `${data.lat} N, ${data.lon} E`;
        document.getElementById('dossier-desc').textContent = data.desc;

        const activityList = document.getElementById('dossier-activity');
        activityList.innerHTML = '';
        data.activity.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            activityList.appendChild(li);
        });

        // Set Threat Color
        const threatSpan = document.getElementById('dossier-threat');
        threatSpan.className = ''; // reset
        if (data.threat === 'CRITICAL') threatSpan.classList.add('accent-red');
        else if (data.threat === 'SEVERE') threatSpan.style.color = '#ffaa00';
        else threatSpan.classList.add('accent-blue');

        // Slide out the panel
        dossierPanel.classList.add('active');
    }

    // --- 5. USGS Seismic "Anomaly" Tracker & Terminal Log ---
    const terminalLog = document.getElementById('terminal-log');
    let knownAnomalies = new Set();

    window.addTerminalLog = function (message, isAlert = false) {
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

    // --- 6. Live Flight Tracker (OpenSky API - Phase 5) ---
    function initFlightTracker(svgMap, mapProjection) {
        // Define an SVG group for flights so they don't overlap under the map
        const flightGroup = svgMap.append("g").attr("class", "flight-layer");

        // Simple airplane icon path (SVG)
        const planePath = "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

        function fetchFlights() {
            // OpenSky Network public API. Bounding box for Middle East Theater
            // [lamin, lomin, lamax, lomax] -> approx Lat 12-42, Lon 34-63
            const OPENSKY_URL = 'https://opensky-network.org/api/states/all?lamin=12&lomin=34&lamax=42&lomax=63';

            fetch(OPENSKY_URL)
                .then(res => res.json())
                .then(data => {
                    if (!data || !data.states) return;

                    // We only want a sample of flights so we don't clog the dashboard
                    const flights = data.states.slice(0, 50).filter(f => f[5] && f[6]);

                    // Data Binding in D3
                    const planes = flightGroup.selectAll("path.flight-node")
                        .data(flights, d => d[0]); // match by unique ICAO24 ID

                    // Remove old planes leaving the airspace
                    planes.exit().remove();

                    // Update existing planes (transition to new coordinates)
                    planes.transition().duration(2000)
                        .attr("transform", d => {
                            const proj = mapProjection([d[5], d[6]]);
                            if (!proj) return "scale(0)";
                            // Rotate plane based on true track (heading)
                            const heading = d[10] || 0;
                            return `translate(${proj[0]}, ${proj[1]}) scale(0.6) rotate(${heading - 45})`; // SVG plane path points diagonally upwards
                        });

                    // Add new planes entering the airspace
                    planes.enter()
                        .append("path")
                        .attr("d", planePath)
                        .attr("class", d => {
                            // Assign tactical classifications randomly or by callsign regex if real
                            const isMilitary = Math.random() > 0.8;
                            const isAlert = Math.random() > 0.95;
                            let c = "flight-node flight-commercial";
                            if (isMilitary) c = "flight-node flight-military";
                            if (isAlert) c = "flight-node flight-alert";
                            return c;
                        })
                        .attr("transform", d => {
                            const proj = mapProjection([d[5], d[6]]);
                            if (!proj) return "scale(0)";
                            const heading = d[10] || 0;
                            return `translate(${proj[0]}, ${proj[1]}) scale(0.6) rotate(${heading - 45})`;
                        })
                        .style("opacity", 0)
                        .transition().duration(1000)
                        .style("opacity", 1);

                })
                .catch(err => {
                    console.log("OpenSky rate limited or err:", err);
                    // Add some fake planes if OpenSky rate limits us (they often do without auth)
                    simulateLocalAirspaceTraffic();
                });
        }

        // To handle OpenSky API restrictive limits for guests, provide a fallback simulation
        function simulateLocalAirspaceTraffic() {
            // Generates 5 fake moving planes in the Persian Gulf if API fails
            const dummyData = Array.from({ length: 5 }).map((_, i) => {
                return [
                    `sim_${i}`, // id
                    "SIM_AIR", // callsign
                    "IR", // country
                    0, 0, // time
                    51 + (Math.random() * 4), // Lon
                    26 + (Math.random() * 4), // Lat
                    0, false, 0,
                    Math.random() * 360 // Heading
                ];
            });

            const planes = flightGroup.selectAll("path.flight-node").data(dummyData, d => d[0]);
            planes.enter()
                .append("path")
                .attr("d", planePath)
                .attr("class", "flight-node flight-military")
                .attr("transform", d => {
                    const proj = mapProjection([d[5], d[6]]);
                    return `translate(${proj[0]}, ${proj[1]}) scale(0.6) rotate(${d[10] - 45})`;
                });

            // Randomly jiggle them manually without re-entering
            flightGroup.selectAll("path.flight-node")
                .transition().duration(3000)
                .attr("transform", function () {
                    const curr = d3.select(this).attr("transform");
                    // Quick regex to extract translate x,y
                    const match = curr.match(/translate\(([^,]+),\s*([^)]+)\)/);
                    if (match) {
                        let nx = parseFloat(match[1]) + (Math.random() * 10 - 5);
                        let ny = parseFloat(match[2]) + (Math.random() * 10 - 5);
                        return `translate(${nx}, ${ny}) scale(0.6) rotate(${Math.random() * 360})`;
                    }
                    return curr;
                });
        }

        // Fetch flight data initially and poll every 15 seconds
        fetchFlights();
        setInterval(fetchFlights, 15000);
    }
});
