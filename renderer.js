const { ipcRenderer } = require('electron');

// DOM Elements
const webview = document.getElementById('webview');
const urlBar = document.getElementById('url-bar');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const toggleAssistantBtn = document.getElementById('toggle-assistant-btn');
const assistantSidebar = document.getElementById('assistant-sidebar');
const closeAssistant = document.getElementById('close-assistant');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const tabBtns = document.querySelectorAll('.tab-btn');
const insightsList = document.getElementById('insights-list');
const dealsList = document.getElementById('deals-list');

let currentUrl = '';
let pageContent = '';

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupWebview();
});

function setupEventListeners() {
    // Navigation
    goBtn.addEventListener('click', navigateToUrl);
    urlBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') navigateToUrl();
    });
    backBtn.addEventListener('click', () => webview.goBack());
    forwardBtn.addEventListener('click', () => webview.goForward());
    refreshBtn.addEventListener('click', () => webview.reload());

    // Assistant
    toggleAssistantBtn.addEventListener('click', toggleAssistant);
    closeAssistant.addEventListener('click', toggleAssistant);
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function setupWebview() {
    webview.addEventListener('did-start-loading', () => {
        console.log('Loading...');
    });

    webview.addEventListener('did-stop-loading', () => {
        currentUrl = webview.getURL();
        urlBar.value = currentUrl;
        extractPageContent();
    });

    webview.addEventListener('did-navigate', (e) => {
        currentUrl = e.url;
        urlBar.value = currentUrl;
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
        currentUrl = e.url;
        urlBar.value = currentUrl;
    });

    webview.addEventListener('new-window', (e) => {
        webview.src = e.url;
    });

    webview.addEventListener('dom-ready', () => {
        extractPageContent();
    });
}

function navigateToUrl() {
    let url = urlBar.value.trim();
    
    if (!url) return;
    
    // Add https:// if no protocol specified
    if (!url.match(/^https?:\/\//i)) {
        // Check if it looks like a URL
        if (url.includes('.') && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            // Treat as search query
            url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
    }
    
    webview.src = url;
    urlBar.value = url;
}

function toggleAssistant() {
    assistantSidebar.classList.toggle('active');
    if (assistantSidebar.classList.contains('active')) {
        extractPageContent();
        analyzeCurrentPage();
    }
}

function switchTab(tabName) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load content for the tab
    if (tabName === 'insights') {
        loadInsights();
    } else if (tabName === 'deals') {
        loadDeals();
    }
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addChatMessage(message, 'user');
    chatInput.value = '';

    // Process the message
    setTimeout(() => {
        processUserQuery(message);
    }, 500);
}

function addChatMessage(message, type = 'assistant') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'assistant-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const label = type === 'user' ? 'You' : 'Assistant';
    contentDiv.innerHTML = `<strong>${label}:</strong> ${message}`;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function extractPageContent() {
    webview.executeJavaScript(`
        (function() {
            const content = {
                title: document.title,
                url: window.location.href,
                domain: window.location.hostname,
                text: document.body.innerText.substring(0, 5000),
                headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent).slice(0, 20),
                images: Array.from(document.querySelectorAll('img')).map(img => img.alt || img.src).slice(0, 10),
                links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent, href: a.href })).slice(0, 20)
            };
            return JSON.stringify(content);
        })();
    `).then(result => {
        try {
            pageContent = JSON.parse(result);
            console.log('Page content extracted:', pageContent);
        } catch (e) {
            console.error('Error parsing page content:', e);
        }
    }).catch(err => {
        console.error('Error extracting content:', err);
    });
}

function processUserQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    if (!pageContent || !pageContent.domain) {
        addChatMessage("I'm still analyzing the page. Please wait a moment and try again.", 'assistant');
        return;
    }

    let response = '';

    // Check what the user is asking about
    if (lowerQuery.includes('coupon') || lowerQuery.includes('discount') || lowerQuery.includes('deal')) {
        response = generateCouponResponse();
    } else if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('cheap')) {
        response = generatePriceResponse();
    } else if (lowerQuery.includes('product') || lowerQuery.includes('item')) {
        response = generateProductResponse();
    } else if (lowerQuery.includes('travel') || lowerQuery.includes('hotel') || lowerQuery.includes('flight')) {
        response = generateTravelResponse();
    } else if (lowerQuery.includes('summary') || lowerQuery.includes('about')) {
        response = generateSummaryResponse();
    } else {
        response = generateContextualResponse(query);
    }

    addChatMessage(response, 'assistant');
}

function generateCouponResponse() {
    const domain = pageContent.domain;
    
    if (domain.includes('macys') || domain.includes('macy')) {
        return `I found some potential deals on Macy's! Here are some tips:\n\n• Check the top banner for current site-wide sales\n• Look for "EXTRA" discount codes on clearance items\n• Common codes: SAVE, FRIEND, SALE\n• Sign up for emails to get 25% off your first order\n• Free shipping on orders $25+`;
    } else if (domain.includes('expedia')) {
        return `Great! For Expedia deals:\n\n• Bundle hotel + flight for up to 30% savings\n• Check "Deals" section for last-minute offers\n• Use code SAVE10 for select hotels\n• Member prices save an average of 10%\n• Book on Sundays for best flight prices`;
    } else {
        return `I'm analyzing ${domain} for deals and coupons. Here are general tips:\n\n• Check the header/footer for promo banners\n• Try common codes: SAVE10, WELCOME, EXTRA20\n• Look for email signup discounts\n• Check if they offer price matching\n• Consider signing up for their loyalty program`;
    }
}

function generatePriceResponse() {
    const domain = pageContent.domain;
    const text = pageContent.text || '';
    
    // Try to find prices in the page text
    const priceRegex = /\$[\d,]+\.?\d*/g;
    const prices = text.match(priceRegex);
    
    let response = `I'm analyzing prices on ${pageContent.title || domain}.\n\n`;
    
    if (prices && prices.length > 0) {
        const uniquePrices = [...new Set(prices)].slice(0, 5);
        response += `I found these prices: ${uniquePrices.join(', ')}\n\n`;
    }
    
    response += `💡 Tips:\n• Compare with other retailers\n• Check for price match guarantees\n• Look for bundle deals\n• Consider seasonal sales`;
    
    return response;
}

function generateProductResponse() {
    const headings = pageContent.headings || [];
    const title = pageContent.title || '';
    
    let response = `📦 Product Information:\n\nPage: ${title}\n\n`;
    
    if (headings.length > 0) {
        response += `Key sections I found:\n`;
        headings.slice(0, 5).forEach(h => {
            if (h.trim().length > 0) {
                response += `• ${h.trim()}\n`;
            }
        });
    }
    
    response += `\n💡 What would you like to know? Ask me about prices, reviews, or alternatives!`;
    
    return response;
}

function generateTravelResponse() {
    const domain = pageContent.domain;
    
    if (domain.includes('expedia') || domain.includes('booking') || domain.includes('hotel')) {
        return `✈️ Travel Tips for ${domain}:\n\n• Book flights on Tuesday/Wednesday for best prices\n• Bundle hotel + flight for extra savings\n• Check flexible dates option\n• Read recent reviews (last 6 months)\n• Look for free cancellation options\n• Compare total cost including fees\n• Check loyalty program benefits`;
    } else {
        return `I can help with travel planning! I'm best at:\n\n✈️ Flight deals and timing\n🏨 Hotel comparisons\n🎫 Activity recommendations\n💰 Budget optimization\n\nNavigate to a travel site like Expedia, Booking.com, or Hotels.com for specific assistance!`;
    }
}

function generateSummaryResponse() {
    const title = pageContent.title || 'this page';
    const domain = pageContent.domain;
    const headings = pageContent.headings || [];
    
    let response = `📄 Page Summary:\n\n`;
    response += `Site: ${domain}\n`;
    response += `Page: ${title}\n\n`;
    
    if (headings.length > 0) {
        response += `Main sections:\n`;
        headings.slice(0, 5).forEach(h => {
            if (h.trim().length > 0) {
                response += `• ${h.trim()}\n`;
            }
        });
    }
    
    return response;
}

function generateContextualResponse(query) {
    const domain = pageContent.domain;
    const title = pageContent.title;
    
    return `I'm here to help you with ${title}!\n\nI can assist with:\n• Finding deals and coupons\n• Price comparisons\n• Product information\n• Travel recommendations\n\nTry asking me about:\n"Are there any coupons?"\n"What's the price?"\n"Tell me about this product"\n"Any travel deals?"`;
}

function analyzeCurrentPage() {
    if (!pageContent || !pageContent.domain) {
        return;
    }

    const domain = pageContent.domain;
    
    // Detect page type and show relevant message
    setTimeout(() => {
        if (domain.includes('macys') || domain.includes('macy')) {
            addChatMessage(`🛍️ I see you're on Macy's! I can help you find coupons, compare prices, and discover deals. What are you shopping for?`, 'assistant');
        } else if (domain.includes('expedia')) {
            addChatMessage(`✈️ Welcome to Expedia! I can help you find travel deals, compare hotels, and save on bookings. Where are you planning to go?`, 'assistant');
        } else if (domain.includes('amazon')) {
            addChatMessage(`📦 Shopping on Amazon! I can help you find deals, check prices, and compare products. What are you looking for?`, 'assistant');
        } else if (domain.includes('walmart') || domain.includes('target')) {
            addChatMessage(`🛒 I can help you find deals and compare prices on ${domain}. What can I help you find?`, 'assistant');
        } else if (domain.includes('booking') || domain.includes('hotel') || domain.includes('airbnb')) {
            addChatMessage(`🏨 Planning a trip? I can help you find the best hotel deals and travel tips!`, 'assistant');
        }
    }, 1000);
}

function loadInsights() {
    if (!pageContent || !pageContent.domain) {
        insightsList.innerHTML = '<p class="info-text">Browse to a shopping or travel site to get insights!</p>';
        return;
    }

    const domain = pageContent.domain;
    const title = pageContent.title;
    const text = pageContent.text || '';
    
    let insights = `<div class="insight-item">
        <h5>🌐 Current Page</h5>
        <p><strong>Site:</strong> ${domain}</p>
        <p><strong>Title:</strong> ${title}</p>
    </div>`;

    // Price detection
    const priceRegex = /\$[\d,]+\.?\d*/g;
    const prices = text.match(priceRegex);
    if (prices && prices.length > 0) {
        const uniquePrices = [...new Set(prices)].slice(0, 5);
        insights += `<div class="insight-item">
            <h5>💰 Prices Found</h5>
            <p>Detected ${prices.length} price mentions</p>
            <p>Range: ${uniquePrices.join(', ')}</p>
        </div>`;
    }

    // Shopping site insights
    if (domain.includes('macys') || domain.includes('amazon') || domain.includes('walmart') || domain.includes('target')) {
        insights += `<div class="insight-item">
            <h5>🛍️ Shopping Tips</h5>
            <p>• Check for promo codes at checkout</p>
            <p>• Compare prices with other retailers</p>
            <p>• Look for free shipping thresholds</p>
            <p>• Check return policy before buying</p>
        </div>`;
    }

    // Travel site insights
    if (domain.includes('expedia') || domain.includes('booking') || domain.includes('hotel')) {
        insights += `<div class="insight-item">
            <h5>✈️ Travel Tips</h5>
            <p>• Best booking day: Tuesday</p>
            <p>• Bundle for extra savings</p>
            <p>• Check flexible dates</p>
            <p>• Read recent reviews</p>
        </div>`;
    }

    insightsList.innerHTML = insights;
}

function loadDeals() {
    if (!pageContent || !pageContent.domain) {
        dealsList.innerHTML = '<p class="info-text">I\'ll search for available deals when you visit shopping sites!</p>';
        return;
    }

    const domain = pageContent.domain;
    let deals = '';

    if (domain.includes('macys') || domain.includes('macy')) {
        deals = `
            <div class="deal-item">
                <h5>💳 Macy's Star Rewards</h5>
                <p>Earn points on every purchase + exclusive offers</p>
                <span class="coupon-code">JOIN NOW</span>
            </div>
            <div class="deal-item">
                <h5>📧 Email Signup Discount</h5>
                <p>Get 25% off your first order when you sign up</p>
                <span class="coupon-code">WELCOME25</span>
            </div>
            <div class="deal-item">
                <h5>🚚 Free Shipping</h5>
                <p>Free shipping on orders $25+</p>
                <span class="price-tag">$25+</span>
            </div>
        `;
    } else if (domain.includes('expedia')) {
        deals = `
            <div class="deal-item">
                <h5>✈️ Bundle & Save</h5>
                <p>Save up to 30% when you bundle hotel + flight</p>
                <span class="price-tag">30% OFF</span>
            </div>
            <div class="deal-item">
                <h5>🏨 Member Pricing</h5>
                <p>Join for free and save an average of 10%</p>
                <span class="coupon-code">JOIN FREE</span>
            </div>
            <div class="deal-item">
                <h5>📱 Mobile App Deal</h5>
                <p>Get exclusive app-only discounts</p>
                <span class="price-tag">APP EXCLUSIVE</span>
            </div>
        `;
    } else if (domain.includes('amazon')) {
        deals = `
            <div class="deal-item">
                <h5>📦 Prime Savings</h5>
                <p>Free 2-day shipping + exclusive deals</p>
                <span class="coupon-code">TRY PRIME</span>
            </div>
            <div class="deal-item">
                <h5>⚡ Lightning Deals</h5>
                <p>Check Today's Deals for limited-time offers</p>
                <span class="price-tag">LIMITED TIME</span>
            </div>
        `;
    } else {
        deals = `
            <div class="deal-item">
                <h5>💡 General Tips</h5>
                <p>• Look for email signup discounts (usually 10-25% off)</p>
                <p>• Check for free shipping thresholds</p>
                <p>• Try coupon codes: SAVE10, WELCOME, EXTRA20</p>
                <p>• Browse the sales/clearance section</p>
            </div>
            <div class="deal-item">
                <h5>🔍 How to Find More Deals</h5>
                <p>• Check browser extensions like Honey or Rakuten</p>
                <p>• Follow the brand on social media</p>
                <p>• Sign up for their newsletter</p>
                <p>• Check RetailMeNot or Coupons.com</p>
            </div>
        `;
    }

    dealsList.innerHTML = deals;

    // Add click handlers for coupon codes
    document.querySelectorAll('.coupon-code').forEach(code => {
        code.addEventListener('click', () => {
            const text = code.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const original = code.textContent;
                code.textContent = '✓ Copied!';
                setTimeout(() => {
                    code.textContent = original;
                }, 2000);
            });
        });
    });
}

// Auto-refresh insights when page changes
setInterval(() => {
    if (assistantSidebar.classList.contains('active')) {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if (activeTab === 'insights') {
            loadInsights();
        } else if (activeTab === 'deals') {
            loadDeals();
        }
    }
}, 5000);
