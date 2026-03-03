document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('map-container');
    if (!container) return;

    // 1. Initialize Map
    // Start centered on Middle East (Tehran area)
    const map = L.map('map-container', {
        center: [32, 53],
        zoom: 4,
        zoomControl: false,
        attributionControl: true
    });

    // 2. Add Tactical Tile Layer
    // Using a dark base map (CartoDB Dark matter is good for tech look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Custom CSS filters are applied to .leaflet-tile in style.css for the radar look

    // 3. UI Controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 4. Layers
    const airLayer = L.layerGroup().addTo(map);
    const seaLayer = L.layerGroup().addTo(map);
    const interceptLayer = L.layerGroup().addTo(map);

    // 5. Aircraft Tracking (OpenSky API)
    async function updateAirTraffic() {
        // Bounding box for Middle East Theater: [lamin, lomin, lamax, lomax] 
        const url = 'https://opensky-network.org/api/states/all?lamin=12&lomin=34&lamax=42&lomax=63';

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data || !data.states) return;

            airLayer.clearLayers();
            data.states.slice(0, 30).forEach(f => {
                const [icao, callsign, country, time, lastSec, lon, lat, baro, surface, velocity, heading] = f;
                if (!lat || !lon) return;

                const marker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'tactical-marker',
                        html: `
                            <div class="marker-icon-plane" style="transform: rotate(${heading}deg)">
                                <i data-lucide="plane" style="width:16px;height:16px;"></i>
                            </div>
                            <div class="marker-label">${callsign || 'UNK-AIR'}</div>
                        `,
                        iconSize: [20, 20]
                    })
                }).addTo(airLayer);

                marker.bindPopup(`<b>FLIGHT: ${callsign || 'UNKNOWN'}</b><br>ORIGIN: ${country}<br>ALTITUDE: ${Math.round(baro)}m<br>SPEED: ${Math.round(velocity * 3.6)} km/h`);
            });
            lucide.createIcons();
        } catch (e) {
            console.log("Air traffic update failed (rate limited or network)");
            simulateAirTraffic(); // Fallback to simulation
        }
    }

    function simulateAirTraffic() {
        // Simple simulation to keep the map alive
        for (let i = 0; i < 8; i++) {
            const lat = 25 + Math.random() * 15;
            const lon = 45 + Math.random() * 15;
            L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'tactical-marker',
                    html: `<div class="marker-icon-plane" style="transform: rotate(${Math.random() * 360}deg)"><i data-lucide="plane" style="width:16px;height:16px;"></i></div><div class="marker-label">SIM-AIR-${i}</div>`,
                    iconSize: [20, 20]
                })
            }).addTo(airLayer);
        }
        lucide.createIcons();
    }

    // 6. Maritime Tracking (Simulated AIS)
    function updateSeaTraffic() {
        seaLayer.clearLayers();
        const vessels = [
            { name: "USS ABRAHAM LINCOLN", type: "Carrier", lat: 25.4, lon: 56.2, pulse: true },
            { name: "IRINS MAKRAN", type: "Forward Base", lat: 27.2, lon: 52.5, pulse: true },
            { name: "MAERSK HANGZHOU", type: "Cargo", lat: 12.8, lon: 43.5, pulse: false },
            { name: "ENERGY LIBERTY", type: "LNG Tanker", lat: 26.5, lon: 54.8, pulse: false }
        ];

        // Add some random simulated ships
        for (let i = 0; i < 15; i++) {
            vessels.push({
                name: `VESSEL-${Math.floor(Math.random() * 9000) + 1000}`,
                type: "Merchant",
                lat: 10 + Math.random() * 25,
                lon: 35 + Math.random() * 30,
                pulse: false
            });
        }

        vessels.forEach(v => {
            const marker = L.marker([v.lat, v.lon], {
                icon: L.divIcon({
                    className: 'tactical-marker',
                    html: `
                        <div class="marker-icon-ship">
                            <i data-lucide="navigation-2" style="width:14px;height:14px;"></i>
                        </div>
                        <div class="marker-label">${v.name}</div>
                    `,
                    iconSize: [16, 16]
                })
            }).addTo(seaLayer);

            marker.bindPopup(`<b>VESSEL: ${v.name}</b><br>TYPE: ${v.type}<br>STATUS: ACTIVE`);
        });
        lucide.createIcons();
    }

    // 7. Global News Signals (Phase 11: Real-time Intercepts)
    window.EscalationEngine = {
        analyze: (headline) => {
            const title = headline.toLowerCase();
            const keywords = ['strike', 'attack', 'explosion', 'missile', 'drone', 'kinetic'];
            const isCritical = keywords.some(k => title.includes(k));

            if (isCritical) {
                // Flash Red Alert on Map
                document.body.classList.add('red-alert');
                setTimeout(() => document.body.classList.remove('red-alert'), 5000);

                // Add pulsate intercept to map (random theater coords or geocoded if we had a gazetteer)
                const lat = 25 + Math.random() * 15;
                const lon = 45 + Math.random() * 15;
                const marker = L.circleMarker([lat, lon], {
                    radius: 20,
                    color: '#ff3333',
                    fillColor: '#ff3333',
                    fillOpacity: 0.4,
                    className: 'pulse-marker'
                }).addTo(interceptLayer);

                setTimeout(() => marker.remove(), 10000);

                // Log to terminal
                if (window.addTerminalLog) {
                    window.addTerminalLog(`CRITICAL SIGNAL INTERCEPTED: ${headline.toUpperCase()}`, true);
                }
            }
        }
    };

    // 8. Initialization & Polling
    updateAirTraffic();
    updateSeaTraffic();
    setInterval(updateAirTraffic, 30000);
    setInterval(updateSeaTraffic, 60000);

    // Expose for external calls
    window.tacticalMap = map;
});
