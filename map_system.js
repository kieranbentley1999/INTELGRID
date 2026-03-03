document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tactical-sat-mount');
    if (!container) return;

    // Safety check for Leaflet
    if (typeof L === 'undefined') {
        console.error("Leaflet not loaded. Map initialization aborted.");
        if (window.addTerminalLog) window.addTerminalLog("CRITICAL: SATELLITE DATALINK LIBRARY (LEAFLET) MISSING.", true);
        return;
    }

    // 1. Initialize Map
    const map = L.map('tactical-sat-mount', {
        center: [32, 53],
        zoom: 4,
        zoomControl: false,
        attributionControl: true
    });

    // Clear status on first tile load
    map.on('tileload', () => {
        const status = document.getElementById('sat-status');
        if (status) status.remove();
    });

    // 2. Add Tactical Satellite Layer
    // Fallback URL if one fails
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
    }).addTo(map);

    satelliteLayer.on('tileerror', () => {
        console.error("Satellite tile load error");
        // Fallback to dark if satellite fails
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    });

    // 3. UI Controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 4. Layers
    const airLayer = L.layerGroup().addTo(map);
    const seaLayer = L.layerGroup().addTo(map);
    const interceptLayer = L.layerGroup().addTo(map);

    // 5. Aircraft Tracking (OpenSky API)
    async function updateAirTraffic() {
        const url = 'https://opensky-network.org/api/states/all?lamin=12&lomin=34&lamax=42&lomax=63';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
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
                            <div class="marker-icon-plane" style="transform: rotate(${heading || 0}deg)">
                                <i data-lucide="plane" style="width:16px;height:16px;"></i>
                            </div>
                            <div class="marker-label">${callsign || 'UNK-AIR'}</div>
                        `,
                        iconSize: [20, 20]
                    })
                }).addTo(airLayer);
                marker.bindPopup(`<b>FLIGHT: ${callsign || 'UNKNOWN'}</b><br>ORIGIN: ${country}<br>ALTITUDE: ${Math.round(baro)}m`);
            });
            if (window.lucide) lucide.createIcons();
        } catch (e) {
            simulateAirTraffic();
        }
    }

    function simulateAirTraffic() {
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
        if (window.lucide) lucide.createIcons();
    }

    // 6. Maritime Tracking
    function updateSeaTraffic() {
        seaLayer.clearLayers();
        const vessels = [
            { name: "USS ABRAHAM LINCOLN", type: "Carrier", lat: 25.4, lon: 56.2 },
            { name: "IRINS MAKRAN", type: "Forward Base", lat: 27.2, lon: 52.5 }
        ];
        vessels.forEach(v => {
            const marker = L.marker([v.lat, v.lon], {
                icon: L.divIcon({
                    className: 'tactical-marker',
                    html: `<div class="marker-icon-ship"><i data-lucide="navigation-2" style="width:14px;height:14px;"></i></div><div class="marker-label">${v.name}</div>`,
                    iconSize: [16, 16]
                })
            }).addTo(seaLayer);
            marker.bindPopup(`<b>VESSEL: ${v.name}</b><br>TYPE: ${v.type}`);
        });
        if (window.lucide) lucide.createIcons();
    }

    // 7. Map Signal Trigger (Integrated with Global EscalationEngine)
    // We attach to the global engine if it exists
    if (window.EscalationEngine) {
        const oldAnalyze = window.EscalationEngine.analyze;
        window.EscalationEngine.analyze = function (headline) {
            oldAnalyze.apply(this, arguments);

            const title = headline.toLowerCase();
            const keywords = ['strike', 'attack', 'explosion', 'missile', 'drone', 'kinetic'];
            if (keywords.some(k => title.includes(k))) {
                const lat = 25 + Math.random() * 15;
                const lon = 45 + Math.random() * 15;
                const marker = L.circleMarker([lat, lon], {
                    radius: 20, color: '#ff3333', fillColor: '#ff3333', fillOpacity: 0.4, className: 'pulse-marker'
                }).addTo(interceptLayer);
                setTimeout(() => marker.remove(), 10000);
            }
        };
    }

    // 8. Initialization
    updateAirTraffic();
    updateSeaTraffic();
    setInterval(updateAirTraffic, 30000);
    setInterval(updateSeaTraffic, 60000);

    window.tacticalMap = map;
});
