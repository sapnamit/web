// Popup script for Smart Shopping Assistant
document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
});

async function initializePopup() {
    // Get current tab information
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Update status based on current page
    updateStatus(tab);
    
    // Set up event listeners
    setupEventListeners();
}

function updateStatus(tab) {
    const statusText = document.getElementById('status-text');
    const url = tab.url;
    
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
        statusText.textContent = 'Not available on this page';
        statusText.style.color = '#ffc107';
    } else if (isShoppingSite(url)) {
        statusText.textContent = 'Price comparison ready';
        statusText.style.color = '#28a745';
    } else if (isTravelSite(url)) {
        statusText.textContent = 'Travel search ready';
        statusText.style.color = '#28a745';
    } else if (isCheckoutPage(url)) {
        statusText.textContent = 'Coupon finder ready';
        statusText.style.color = '#28a745';
    } else {
        statusText.textContent = 'General assistant ready';
        statusText.style.color = '#6c757d';
    }
}

function isShoppingSite(url) {
    const shoppingSites = [
        'amazon.com', 'walmart.com', 'target.com', 'bestbuy.com', 
        'macys.com', 'ebay.com', 'costco.com', 'homedepot.com',
        'lowes.com', 'kohls.com', 'nordstrom.com', 'zappos.com'
    ];
    return shoppingSites.some(site => url.includes(site));
}

function isTravelSite(url) {
    const travelSites = [
        'expedia.com', 'booking.com', 'kayak.com', 'priceline.com',
        'hotels.com', 'airbnb.com', 'vrbo.com', 'tripadvisor.com'
    ];
    return travelSites.some(site => url.includes(site));
}

function isCheckoutPage(url) {
    const checkoutKeywords = ['checkout', 'cart', 'payment', 'billing', 'order'];
    return checkoutKeywords.some(keyword => url.toLowerCase().includes(keyword));
}

function setupEventListeners() {
    // Add click handlers for feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function openPriceComparison() {
    // Send message to content script to show price comparison
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'showPriceComparison'
        });
    });
    
    // Close popup
    window.close();
}

function openCouponFinder() {
    // Send message to content script to show coupon finder
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'showCoupons'
        });
    });
    
    // Close popup
    window.close();
}

function openTravelSearch() {
    // Send message to content script to show travel search
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'showTravelSearch'
        });
    });
    
    // Close popup
    window.close();
}

function openSettings() {
    // Open settings page
    chrome.tabs.create({
        url: chrome.runtime.getURL('settings.html')
    });
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStatus') {
        updateStatus(request.tab);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                openPriceComparison();
                break;
            case '2':
                e.preventDefault();
                openCouponFinder();
                break;
            case '3':
                e.preventDefault();
                openTravelSearch();
                break;
        }
    }
});