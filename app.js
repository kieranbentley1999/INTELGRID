document.addEventListener('DOMContentLoaded', () => {
    // Config
    const RSS_URL = 'https://news.google.com/rss/search?q=America+Iran+when:1d&hl=en-US&gl=US&ceid=US:en';

    // DOM Elements
    const elements = {
        grid: document.getElementById('news-grid'),
        loadingState: document.getElementById('loading-state'),
        errorState: document.getElementById('error-state'),
        refreshBtn: document.getElementById('refresh-btn'),
        retryBtn: document.getElementById('retry-btn'),
        tickerContent: document.getElementById('live-ticker'),
        loadMoreBtn: document.getElementById('load-more-btn'),
        paginationContainer: document.getElementById('pagination-container')
    };

    // State
    let isFetching = false;
    let allNewsItems = [];
    let currentDisplayCount = 0;
    const ITEMS_PER_PAGE = 9;

    // Initialize
    fetchNews();

    // Event Listeners
    elements.refreshBtn.addEventListener('click', () => {
        if (!isFetching) fetchNews();
    });

    elements.retryBtn.addEventListener('click', fetchNews);

    elements.loadMoreBtn.addEventListener('click', () => {
        currentDisplayCount += ITEMS_PER_PAGE;
        renderNewsChunk();
    });

    // Core Fetch Function
    async function fetchNews() {
        isFetching = true;
        updateUIState('loading');
        elements.refreshBtn.classList.add('active');

        try {
            // Append cache buster to the Google News URL to force fresh data
            const targetUrl = `${RSS_URL}&cb=${new Date().getTime()}`;

            // Use AllOrigins as a RAW CORS proxy to avoid rss2json caching delays
            const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

            const response = await fetch(PROXY_URL);
            if (!response.ok) throw new Error('Network response was not ok');

            const textData = await response.text();

            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(textData, "text/xml");

            const items = Array.from(xmlDoc.querySelectorAll('item')).map(itemNode => {
                const title = itemNode.querySelector('title')?.textContent || 'No Title';
                const link = itemNode.querySelector('link')?.textContent || '#';
                const pubDate = itemNode.querySelector('pubDate')?.textContent || new Date().toISOString();

                let imgUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'; // fallback
                const desc = itemNode.querySelector('description')?.textContent || '';
                if (desc) {
                    // Try to rip an image tag out of the google news HTML description
                    const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch && imgMatch[1]) {
                        imgUrl = imgMatch[1];
                    }
                }

                // Feed title into Escalation Engine
                if (window.EscalationEngine) window.EscalationEngine.analyze(title);

                return { title, link, pubDate, thumbnail: imgUrl };
            });

            if (items.length > 0) {
                // Ensure items are sorted by newest first
                allNewsItems = items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                currentDisplayCount = ITEMS_PER_PAGE;
                elements.grid.innerHTML = ''; // Clear prior entries

                renderNewsChunk();
                updateTicker(allNewsItems);
                updateUIState('success');
            } else {
                throw new Error('API returned no new items');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            updateUIState('error');
        } finally {
            isFetching = false;
            elements.refreshBtn.classList.remove('active');
        }
    }

    // UI Updates
    function updateUIState(state) {
        elements.loadingState.classList.add('hidden');
        elements.errorState.classList.add('hidden');
        elements.grid.classList.add('hidden');
        elements.paginationContainer.classList.add('hidden');

        if (state === 'loading') elements.loadingState.classList.remove('hidden');
        if (state === 'error') elements.errorState.classList.remove('hidden');
        if (state === 'success') {
            elements.grid.classList.remove('hidden');
            if (currentDisplayCount < allNewsItems.length) {
                elements.paginationContainer.classList.remove('hidden');
            }
        }
    }

    function renderNewsChunk() {
        const itemsToRender = allNewsItems.slice(0, currentDisplayCount);
        elements.grid.innerHTML = ''; // Re-render from scratch for simplicity

        itemsToRender.forEach((item, index) => {
            // Determine if "urgent" based on keywords or just randomly for aesthetic demo
            const titleLow = item.title.toLowerCase();
            const isUrgent = titleLow.includes('attack') || titleLow.includes('strike') || index === 0;

            // Extract a source from the title (Google News format "- SourceName")
            let source = "Unknown Source";
            let cleanTitle = item.title;
            const sourceSplit = item.title.lastIndexOf(' - ');
            if (sourceSplit !== -1) {
                source = item.title.substring(sourceSplit + 3);
                cleanTitle = item.title.substring(0, sourceSplit);
            }

            // Formatting Date
            const pubDate = new Date(item.pubDate);
            const timeAgo = getTimeAgo(pubDate);

            // Construct Card
            const card = document.createElement('a');
            card.href = item.link;
            card.target = "_blank";
            card.className = `news-card ${isUrgent ? 'urgent' : ''}`;

            // Thumbnail (rss2json sometimes provides thumbnail, or enclosure)
            let imgUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'; // fallback tactical image
            if (item.thumbnail) imgUrl = item.thumbnail;
            else if (item.enclosure && item.enclosure.link) imgUrl = item.enclosure.link;

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <div class="card-source-tag">${source}</div>
                    <img src="${imgUrl}" alt="News visual" class="card-image" onerror="this.src='https://images.unsplash.com/photo-1579373903781-430f83693fdd?auto=format&fit=crop&w=600&q=80'">
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <i data-lucide="clock"></i>
                        <span>${timeAgo}</span>
                    </div>
                    <h3 class="card-title">${cleanTitle}</h3>
                    <div class="card-footer">
                        <span class="read-more">READ REPORT <i data-lucide="chevron-right" style="width:14px;height:14px;"></i></span>
                    </div>
                </div>
            `;

            elements.grid.appendChild(card);
        });

        // Re-initialize lucide icons for newly added elements
        lucide.createIcons();

        // Update load more button state
        if (currentDisplayCount >= allNewsItems.length) {
            elements.paginationContainer.classList.add('hidden');
        } else {
            elements.paginationContainer.classList.remove('hidden');
        }
    }

    function updateTicker(items) {
        const headlines = items.slice(0, 5).map(item => {
            const split = item.title.lastIndexOf(' - ');
            return split !== -1 ? item.title.substring(0, split) : item.title;
        });

        const tickerString = headlines.join(' &nbsp;&nbsp;&bull;&nbsp;&nbsp; ') + ' &nbsp;&nbsp;&bull;&nbsp;&nbsp; ' + headlines[0];

        elements.tickerContent.innerHTML = `<span>${tickerString}</span>`;
    }

    // Helpers
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 3600;

        if (interval > 24) {
            return Math.floor(interval / 24) + " days ago";
        }
        if (interval >= 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval >= 1) {
            return Math.floor(interval) + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    }
});
