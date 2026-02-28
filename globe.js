document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (!container || typeof THREE === 'undefined') return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 250;
    camera.position.y = 50; // Tilt down slightly

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 2. Create the Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 3. Create Tactical Wireframe Globe
    const radius = 100;
    const segments = 64;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);

    // Wireframe setup mapping to a high-tech "Holo" look
    const material = new THREE.MeshBasicMaterial({
        color: 0x00d4ff, // Accent Blue
        wireframe: true,
        transparent: true,
        opacity: 0.08 // Reduced opacity to make borders pop
    });

    const earthMesh = new THREE.Mesh(geometry, material);
    earthGroup.add(earthMesh);

    // 3.5 Draw Country Borders from GeoJSON
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff, // Bright neon cyan
        linewidth: 2, // Note: WebGL line thickness is often limited to 1 across browsers, but we set it just in case
        transparent: true,
        opacity: 0.8 // High opacity
    });

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                if (feature.geometry.type === 'Polygon') {
                    drawBorder(feature.geometry.coordinates[0]);
                } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(polygon => {
                        drawBorder(polygon[0]);
                    });
                }
            });
        })
        .catch(err => console.error("Could not load map data", err));

    function drawBorder(coords) {
        const points = [];
        coords.forEach(coord => {
            const lon = coord[0];
            const lat = coord[1];
            // Radius + 1.0 to ensure it sits clearly above the wireframe and solid core
            points.push(getPositionFromLatLon(lat, lon, radius + 1.0));
        });

        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMaterial);
        earthGroup.add(line);
    }

    // Add a core solid sphere to hide back lines
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x020406,
        transparent: true,
        opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(radius - 0.5, 32, 32), coreMat);
    earthGroup.add(coreMesh);

    // 4. Add "Strike Nodes" (Threat Points)
    const pointsGroup = new THREE.Group();
    earthGroup.add(pointsGroup);

    // Utility: Lat/Lon to Vector3
    function getPositionFromLatLon(lat, lon, r) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(r * Math.sin(phi) * Math.cos(theta));
        const z = (r * Math.sin(phi) * Math.sin(theta));
        const y = (r * Math.cos(phi));

        return new THREE.Vector3(x, y, z);
    }

    // Create a target marker
    function createTargetNode(lat, lon, size = 1) {
        const pos = getPositionFromLatLon(lat, lon, radius);

        // The pulsing base
        const dotGeo = new THREE.SphereGeometry(size, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xff3366 }); // Danger red
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);

        // The rising pillar
        const pillarGeo = new THREE.CylinderGeometry(0.2, size, size * 10, 8);
        // Translate geometry so it grows outward from the surface
        pillarGeo.translate(0, (size * 10) / 2, 0);
        const pillarMat = new THREE.MeshBasicMaterial({
            color: 0xff3366,
            transparent: true,
            opacity: 0.6
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);

        // Orient pillar to face outward from center
        pillar.position.copy(pos);
        pillar.lookAt(new THREE.Vector3(0, 0, 0));
        pillar.rotateX(Math.PI / 2); // Correct cylinder orientation

        pointsGroup.add(dot);
        pointsGroup.add(pillar);
    }

    // Seed some initial conflict zones
    const threats = [
        { lat: 35.6892, lon: 51.3890 }, // Tehran
        { lat: 38.8951, lon: -77.0364 }, // Washington DC
        { lat: 31.0461, lon: 34.8516 }, // Israel
        { lat: 55.7558, lon: 37.6173 }, // Moscow
        { lat: 15.3694, lon: 44.1910 }, // Sanaa (Yemen)
        { lat: 25.2048, lon: 55.2708 }, // Dubai
    ];

    threats.forEach(t => createTargetNode(t.lat, t.lon, 2));

    // Expose function to add targets dynamically later
    window.addGlobeThreat = (lat, lon) => {
        createTargetNode(lat, lon, 1.5);
    };

    // 5. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the earth slowly
        earthGroup.rotation.y += 0.002;

        // Add subtle tilt wobble
        earthGroup.rotation.z = Math.sin(Date.now() * 0.0005) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
});
