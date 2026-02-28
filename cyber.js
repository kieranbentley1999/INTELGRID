document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('cyber-terminal-output');
    if (!terminalOutput) return;

    // CISA Known Exploited Vulnerabilities Catalog
    const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
    const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(CISA_KEV_URL)}`;

    let vulnerabilities = [];
    let currentIndex = 0;

    async function fetchCyberThreats() {
        try {
            const response = await fetch(PROXY_URL);
            if (!response.ok) throw new Error('CISA Feed connection failed');

            const data = await response.json();

            // Get the list of vulnerabilities and sort by dateAdded (newest first)
            vulnerabilities = data.vulnerabilities.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

            // Clear the loading text
            terminalOutput.innerHTML = '';

            // Start the streaming simulation
            streamLogs();

        } catch (error) {
            console.error('Cyber Feed Error:', error);
            appendLog(`<span style="color: var(--danger);">[ERROR] Signal Intercept Failed: ${error.message}</span>`);
            appendLog(`<span style="color: #8b949e;">[INFO] Attempting re-establishment in 30 seconds...</span>`);
            setTimeout(fetchCyberThreats, 30000);
        }
    }

    function streamLogs() {
        if (vulnerabilities.length === 0) return;

        // Pick the next vulnerability
        const vuln = vulnerabilities[currentIndex];

        // Format the output
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const severityColor = vuln.knownRansomwareCampaignUse === 'Known' ? 'var(--danger)' : '#ffcc00';

        const logLine = `
            <div style="margin-bottom: 8px; border-left: 2px solid ${severityColor}; padding-left: 10px;">
                <span style="color: #8b949e;">[${timestamp} ZULU]</span> 
                <span style="color: ${severityColor}; font-weight: bold;">[IDENT: ${vuln.cveID}]</span> 
                <span style="color: #fff;">${vuln.vendorProject} ${vuln.product}</span>
                <br/>
                <span style="opacity: 0.8; font-size: 0.8rem;">DETECTED VECTOR: ${vuln.vulnerabilityName}</span>
                <br/>
                <span style="opacity: 0.6; font-size: 0.75rem;">ACTION REQ: ${vuln.requiredAction}</span>
            </div>
        `;

        appendLog(logLine);

        // Feed CVE payload into Escalation Engine & plot a new strike node
        if (window.EscalationEngine) window.EscalationEngine.analyze(vuln.vulnerabilityName);
        if (window.addGlobeThreat) {
            // Randomly offset from generic Middle East coordinates for visual variety
            const lat = 25 + Math.random() * 20;
            const lon = 40 + Math.random() * 20;
            window.addGlobeThreat(lat, lon);
        }

        // Advance index, loop back if we hit the end
        currentIndex++;
        if (currentIndex >= 50) currentIndex = 0; // Just loop the top 50 recent to keep it fresh

        // Calculate a random delay before the next "intercept" (between 1.5s and 4s)
        const nextDelay = Math.random() * 2500 + 1500;
        setTimeout(streamLogs, nextDelay);
    }

    function appendLog(htmlString) {
        // Create an element
        const entry = document.createElement('div');
        entry.innerHTML = htmlString;

        // Add it to the terminal
        terminalOutput.appendChild(entry);

        // Keep only top 15 logs to prevent DOM bloat
        while (terminalOutput.children.length > 15) {
            terminalOutput.removeChild(terminalOutput.firstChild);
        }

        // Auto scroll to bottom smoothly
        terminalOutput.scrollTo({
            top: terminalOutput.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Initialize fetch
    setTimeout(fetchCyberThreats, 1500); // Slight delay for dramatic startup effect
});
