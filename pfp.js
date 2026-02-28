// PFP Generator Logic
document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('pfp-upload');
    const canvas = document.getElementById('pfp-canvas');
    const ctx = canvas.getContext('2d');
    const placeholder = document.getElementById('pfp-placeholder');
    const downloadBtn = document.getElementById('download-pfp-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let currentImage = null;
    let currentFilter = 'nightvision';

    // Handle Image Upload
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                renderComposite();
                placeholder.style.display = 'none';
                canvas.style.display = 'block';
                downloadBtn.style.display = 'inline-block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Handle Filter Selection
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            const target = e.target.closest('button');
            target.classList.add('active');
            currentFilter = target.dataset.filter;
            if (currentImage) renderComposite();
        });
    });

    // Handle Download
    downloadBtn.addEventListener('click', () => {
        if (!currentImage) return;
        const link = document.createElement('a');
        link.download = 'INTEL_Operative_PFP.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Core Drawing Logic
    function renderComposite() {
        if (!currentImage) return;

        const w = canvas.width;
        const h = canvas.height;

        // 1. Draw Base Image (Covering the square)
        ctx.clearRect(0, 0, w, h);

        // Calculate crop to fill 500x500 square smoothly
        const scale = Math.max(w / currentImage.width, h / currentImage.height);
        const x = (w / 2) - (currentImage.width / 2) * scale;
        const y = (h / 2) - (currentImage.height / 2) * scale;

        ctx.drawImage(currentImage, x, y, currentImage.width * scale, currentImage.height * scale);

        // 2. Apply Combat Filter (Night Vision or Thermal)
        applyColorGrade(w, h);

        // 3. Draw Tactical HUD Overlay
        drawHUD(w, h);
    }

    function applyColorGrade(w, h) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Standard Grayscale conversion for contrast
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;

            if (currentFilter === 'nightvision') {
                // High contrast green tint
                data[i] = 0; // R
                data[i + 1] = Math.min(255, gray * 1.5 + 20); // G
                data[i + 2] = 0; // B
            } else if (currentFilter === 'thermal') {
                // Fake Thermal logic (hot = red/yellow, cold = blue/dark)
                if (gray > 180) {
                    data[i] = 255; // R
                    data[i + 1] = Math.max(0, gray - 50); // G
                    data[i + 2] = 0; // B
                } else if (gray > 100) {
                    data[i] = gray + 50;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                } else {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = Math.min(255, gray + 100);
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);

        // Add scanlines
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }

        // Add Vignette
        const gradient = ctx.createRadialGradient(w / 2, h / 2, w / 4, w / 2, h / 2, w);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    function drawHUD(w, h) {
        const color = currentFilter === 'nightvision' ? '#00ff80' : '#ff3366';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        // Center Crosshair
        ctx.beginPath();
        ctx.moveTo(w / 2 - 20, h / 2);
        ctx.lineTo(w / 2 + 20, h / 2);
        ctx.moveTo(w / 2, h / 2 - 20);
        ctx.lineTo(w / 2, h / 2 + 20);
        ctx.stroke();

        // Corner brackets (Top Left)
        ctx.beginPath();
        ctx.moveTo(20, 50);
        ctx.lineTo(20, 20);
        ctx.lineTo(50, 20);
        ctx.stroke();

        // Corner brackets (Top Right)
        ctx.beginPath();
        ctx.moveTo(w - 50, 20);
        ctx.lineTo(w - 20, 20);
        ctx.lineTo(w - 20, 50);
        ctx.stroke();

        // Corner brackets (Bottom Left)
        ctx.beginPath();
        ctx.moveTo(20, h - 50);
        ctx.lineTo(20, h - 20);
        ctx.lineTo(50, h - 20);
        ctx.stroke();

        // Corner brackets (Bottom Right)
        ctx.beginPath();
        ctx.moveTo(w - 50, h - 20);
        ctx.lineTo(w - 20, h - 20);
        ctx.lineTo(w - 20, h - 50);
        ctx.stroke();

        // Fake Data overlays
        ctx.font = '10px "Courier New", monospace';
        ctx.fillText('REC \u25CF', 30, 40);
        ctx.fillText('TGT: ACQUIRED', w - 110, 40);

        const time = new Date().toISOString().split('T')[1].split('.')[0];
        ctx.fillText(`ZULU: ${time}`, 30, h - 30);
    }
});
