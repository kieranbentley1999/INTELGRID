document.addEventListener('DOMContentLoaded', () => {
    // Config
    const RSS_URL = 'https://news.google.com/rss/search?q=America+Iran+when:1d&hl=en-US&gl=US&ceid=US:en';
    // Using an RSS-to-JSON service like rsstojson to avoid CORS and get clean JSON without an API key
    // A reliable free one is api.rss2json.com
    const API_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

    // DOM Elements
    const elements = {
        grid: document.getElementById('news-grid'),
        loadingState: document.getElementById('loading-state'),
        errorState: document.getElementById('error-state'),
        refreshBtn: document.getElementById('refresh-btn'),
        retryBtn: document.getElementById('retry-btn'),
        tickerContent: document.getElementById('live-ticker')
    };

    // State
    let isFetching = false;

    // Initialize
    fetchNews();

    // Event Listeners
    elements.refreshBtn.addEventListener('click', () => {
        if (!isFetching) fetchNews();
    });

    elements.retryBtn.addEventListener('click', fetchNews);

    // Core Fetch Function
    async function fetchNews() {
        isFetching = true;
        updateUIState('loading');
        elements.refreshBtn.classList.add('active');

        try {
            const response = await fetch(API_ENDPOINT);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.status === 'ok') {
                // Ensure items are sorted by newest first
                const sortedItems = data.items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                renderNews(sortedItems);
                updateTicker(sortedItems);
                updateUIState('success');
            } else {
                throw new Error('API returned error status');
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

        if (state === 'loading') elements.loadingState.classList.remove('hidden');
        if (state === 'error') elements.errorState.classList.remove('hidden');
        if (state === 'success') elements.grid.classList.remove('hidden');
    }

    function renderNews(items) {
        elements.grid.innerHTML = ''; // Clear existing

        items.forEach((item, index) => {
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
