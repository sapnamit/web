// Content script for Smart Shopping Assistant
class ContentScript {
  constructor() {
    this.currentPageType = null;
    this.pricePanel = null;
    this.couponPanel = null;
    this.travelPanel = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.currentPageType = await this.detectPageType();
    
    // Initialize based on page type
    switch (this.currentPageType) {
      case 'shopping':
        await this.initializeShoppingFeatures();
        break;
      case 'travel':
        await this.initializeTravelFeatures();
        break;
      case 'checkout':
        await this.initializeCouponFeatures();
        break;
    }
    
    // Always add the main assistant button
    this.addAssistantButton();
  }

  async detectPageType() {
    const url = window.location.href;
    const domain = window.location.hostname;
    
    // Send message to background script for analysis
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'analyzePage' }, (response) => {
        resolve(response?.data?.pageType || 'general');
      });
    });
  }

  async initializeShoppingFeatures() {
    // Wait a bit for page to fully render
    setTimeout(() => {
      this.detectProductInfo();
      this.addPriceComparisonButton();
    }, 2000);
  }

  async initializeTravelFeatures() {
    setTimeout(() => {
      this.addTravelSearchButton();
    }, 1000);
  }

  async initializeCouponFeatures() {
    setTimeout(() => {
      this.detectCheckoutPage();
      this.addCouponButton();
    }, 1000);
  }

  detectProductInfo() {
    const productInfo = {
      name: this.extractProductName(),
      brand: this.extractBrand(),
      model: this.extractModel(),
      price: this.extractPrice(),
      imageUrl: this.extractImageUrl(),
      url: window.location.href
    };
    
    if (productInfo.name && productInfo.price) {
      this.productInfo = productInfo;
      console.log('Product detected:', productInfo);
    }
  }

  extractProductName() {
    // Try multiple selectors for product name
    const selectors = [
      'h1[data-testid="product-title"]',
      'h1.product-title',
      'h1[class*="product"]',
      'h1[class*="title"]',
      '.product-name h1',
      '.product-title',
      'h1',
      '[data-testid="product-name"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return document.title;
  }

  extractBrand() {
    const selectors = [
      '[data-testid="brand"]',
      '.brand',
      '.product-brand',
      '[class*="brand"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return null;
  }

  extractModel() {
    const selectors = [
      '[data-testid="model"]',
      '.model',
      '.product-model',
      '[class*="model"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return null;
  }

  extractPrice() {
    const selectors = [
      '[data-testid="price"]',
      '.price',
      '.product-price',
      '[class*="price"]',
      '.current-price',
      '.sale-price',
      '.regular-price'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const priceText = element.textContent.replace(/[^0-9.,]/g, '');
        const price = parseFloat(priceText.replace(',', ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }
    
    return null;
  }

  extractImageUrl() {
    const selectors = [
      '[data-testid="product-image"] img',
      '.product-image img',
      '.main-image img',
      'img[class*="product"]',
      'img[alt*="product"]'
    ];
    
    for (const selector of selectors) {
      const img = document.querySelector(selector);
      if (img && img.src) {
        return img.src;
      }
    }
    
    return null;
  }

  addPriceComparisonButton() {
    if (document.getElementById('smart-shopping-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'smart-shopping-btn';
    button.innerHTML = '🔍 Compare Prices';
    button.className = 'smart-shopping-btn';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,123,255,0.3);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => this.showPriceComparison());
    document.body.appendChild(button);
  }

  addTravelSearchButton() {
    if (document.getElementById('smart-travel-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'smart-travel-btn';
    button.innerHTML = '✈️ Smart Travel Search';
    button.className = 'smart-travel-btn';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(40,167,69,0.3);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => this.showTravelSearch());
    document.body.appendChild(button);
  }

  addCouponButton() {
    if (document.getElementById('smart-coupon-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'smart-coupon-btn';
    button.innerHTML = '🎟️ Find Coupons';
    button.className = 'smart-coupon-btn';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #ffc107;
      color: #212529;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(255,193,7,0.3);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => this.showCoupons());
    document.body.appendChild(button);
  }

  addAssistantButton() {
    if (document.getElementById('smart-assistant-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'smart-assistant-btn';
    button.innerHTML = '🤖 Smart Assistant';
    button.className = 'smart-assistant-btn';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: #6f42c1;
      color: white;
      border: none;
      padding: 15px 25px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 6px 20px rgba(111,66,193,0.4);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => this.showAssistantMenu());
    document.body.appendChild(button);
  }

  async showPriceComparison() {
    if (!this.productInfo) {
      alert('No product information detected on this page.');
      return;
    }
    
    // Send message to background script to get prices
    chrome.runtime.sendMessage({
      action: 'getProductPrices',
      productInfo: this.productInfo
    }, (response) => {
      if (response.success) {
        this.displayPriceComparison(response.data);
      } else {
        console.error('Error getting prices:', response.error);
      }
    });
  }

  displayPriceComparison(data) {
    this.removeExistingPanel('price-panel');
    
    const panel = document.createElement('div');
    panel.id = 'price-panel';
    panel.className = 'smart-panel';
    panel.innerHTML = this.createPriceComparisonHTML(data);
    
    document.body.appendChild(panel);
    this.pricePanel = panel;
  }

  createPriceComparisonHTML(data) {
    const { product, prices, savings } = data;
    
    let html = `
      <div class="panel-header">
        <h3>💰 Price Comparison for ${product.name}</h3>
        <button class="close-btn" onclick="this.closest('.smart-panel').remove()">×</button>
      </div>
      <div class="panel-content">
        <div class="current-price">
          <strong>Current Price: $${product.price}</strong>
        </div>
    `;
    
    if (savings && savings.amount > 0) {
      html += `
        <div class="savings-info">
          <span class="savings-amount">You could save $${savings.amount.toFixed(2)} (${savings.percent.toFixed(1)}%)</span>
        </div>
      `;
    }
    
    html += '<div class="price-list">';
    
    prices.forEach(price => {
      html += `
        <div class="price-item">
          <div class="store-info">
            <strong>${price.store}</strong>
            <span class="rating">⭐ ${price.rating.toFixed(1)}</span>
          </div>
          <div class="price-info">
            <span class="price">$${price.price}</span>
            <span class="availability">${price.availability}</span>
            <span class="shipping">${price.shipping}</span>
          </div>
          <a href="${price.url}" target="_blank" class="visit-btn">Visit Store</a>
        </div>
      `;
    });
    
    html += '</div></div>';
    
    return html;
  }

  async showCoupons() {
    const storeInfo = {
      domain: window.location.hostname,
      storeName: this.extractStoreName(),
      cartValue: this.extractCartValue()
    };
    
    chrome.runtime.sendMessage({
      action: 'getCoupons',
      storeInfo: storeInfo
    }, (response) => {
      if (response.success) {
        this.displayCoupons(response.data);
      } else {
        console.error('Error getting coupons:', response.error);
      }
    });
  }

  displayCoupons(data) {
    this.removeExistingPanel('coupon-panel');
    
    const panel = document.createElement('div');
    panel.id = 'coupon-panel';
    panel.className = 'smart-panel';
    panel.innerHTML = this.createCouponsHTML(data);
    
    document.body.appendChild(panel);
    this.couponPanel = panel;
  }

  createCouponsHTML(data) {
    let html = `
      <div class="panel-header">
        <h3>🎟️ Available Coupons for ${data.store}</h3>
        <button class="close-btn" onclick="this.closest('.smart-panel').remove()">×</button>
      </div>
      <div class="panel-content">
    `;
    
    if (data.coupons.length === 0) {
      html += '<p>No coupons available at the moment.</p>';
    } else {
      data.coupons.forEach(coupon => {
        html += `
          <div class="coupon-item">
            <div class="coupon-code">${coupon.code}</div>
            <div class="coupon-details">
              <div class="coupon-description">${coupon.description}</div>
              <div class="coupon-requirements">Min order: $${coupon.minOrder}</div>
              <div class="coupon-expires">Expires: ${coupon.expires}</div>
            </div>
            <button class="apply-coupon-btn" onclick="window.smartAssistant.applyCoupon('${coupon.code}')">
              Apply
            </button>
          </div>
        `;
      });
    }
    
    html += '</div>';
    return html;
  }

  async showTravelSearch() {
    this.removeExistingPanel('travel-panel');
    
    const panel = document.createElement('div');
    panel.id = 'travel-panel';
    panel.className = 'smart-panel';
    panel.innerHTML = this.createTravelSearchHTML();
    
    document.body.appendChild(panel);
    this.travelPanel = panel;
  }

  createTravelSearchHTML() {
    return `
      <div class="panel-header">
        <h3>✈️ Smart Travel Search</h3>
        <button class="close-btn" onclick="this.closest('.smart-panel').remove()">×</button>
      </div>
      <div class="panel-content">
        <form id="travel-search-form">
          <div class="form-group">
            <label>From:</label>
            <input type="text" id="origin" placeholder="Departure city" required>
          </div>
          <div class="form-group">
            <label>To:</label>
            <input type="text" id="destination" placeholder="Destination city" required>
          </div>
          <div class="form-group">
            <label>Departure:</label>
            <input type="date" id="departure" required>
          </div>
          <div class="form-group">
            <label>Return:</label>
            <input type="date" id="return">
          </div>
          <div class="form-group">
            <label>Passengers:</label>
            <select id="passengers">
              <option value="1">1</option>
              <option value="2" selected>2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <button type="submit" class="search-btn">Search Flights & Hotels</button>
        </form>
        <div id="travel-results" class="travel-results"></div>
      </div>
    `;
  }

  showAssistantMenu() {
    // Create a context menu for the assistant
    const menu = document.createElement('div');
    menu.id = 'assistant-menu';
    menu.className = 'assistant-menu';
    menu.innerHTML = `
      <div class="menu-item" onclick="window.smartAssistant.showPriceComparison()">
        🔍 Compare Prices
      </div>
      <div class="menu-item" onclick="window.smartAssistant.showCoupons()">
        🎟️ Find Coupons
      </div>
      <div class="menu-item" onclick="window.smartAssistant.showTravelSearch()">
        ✈️ Travel Search
      </div>
      <div class="menu-item" onclick="window.smartAssistant.toggleNotifications()">
        🔔 Notifications
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // Remove menu after 3 seconds
    setTimeout(() => {
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
    }, 3000);
  }

  removeExistingPanel(panelId) {
    const existingPanel = document.getElementById(panelId);
    if (existingPanel) {
      existingPanel.remove();
    }
  }

  extractStoreName() {
    const domain = window.location.hostname;
    return domain.replace('www.', '').split('.')[0];
  }

  extractCartValue() {
    // Try to find cart total on checkout pages
    const selectors = [
      '.cart-total',
      '.checkout-total',
      '.order-total',
      '[class*="total"]',
      '[data-testid="total"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.replace(/[^0-9.,]/g, '');
        const value = parseFloat(text.replace(',', ''));
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }
    
    return 0;
  }

  detectCheckoutPage() {
    const url = window.location.href;
    const checkoutIndicators = ['checkout', 'cart', 'payment', 'billing'];
    
    return checkoutIndicators.some(indicator => 
      url.toLowerCase().includes(indicator)
    );
  }

  async applyCoupon(couponCode) {
    const storeInfo = {
      domain: window.location.hostname,
      storeName: this.extractStoreName(),
      cartValue: this.extractCartValue()
    };
    
    chrome.runtime.sendMessage({
      action: 'applyCoupon',
      couponCode: couponCode,
      storeInfo: storeInfo
    }, (response) => {
      if (response.success) {
        alert(response.data.message);
      } else {
        alert('Failed to apply coupon: ' + response.data.message);
      }
    });
  }
}

// Initialize content script
const smartAssistant = new ContentScript();

// Make it globally accessible for onclick handlers
window.smartAssistant = smartAssistant;

// Handle travel search form submission
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('search-btn')) {
    e.preventDefault();
    const form = e.target.closest('form');
    const formData = new FormData(form);
    
    const travelInfo = {
      origin: form.querySelector('#origin').value,
      destination: form.querySelector('#destination').value,
      departureDate: form.querySelector('#departure').value,
      returnDate: form.querySelector('#return').value,
      passengers: parseInt(form.querySelector('#passengers').value)
    };
    
    chrome.runtime.sendMessage({
      action: 'searchTravel',
      travelInfo: travelInfo
    }, (response) => {
      if (response.success) {
        smartAssistant.displayTravelResults(response.data);
      } else {
        console.error('Error searching travel:', response.error);
      }
    });
  }
});

// Add method to display travel results
smartAssistant.displayTravelResults = function(data) {
  const resultsDiv = document.getElementById('travel-results');
  if (!resultsDiv) return;
  
  let html = '<h4>Search Results:</h4>';
  
  if (data.flights && data.flights.length > 0) {
    html += '<h5>Flights:</h5>';
    data.flights.forEach(flight => {
      html += `
        <div class="flight-item">
          <div class="flight-info">
            <strong>${flight.airline}</strong>
            <span class="flight-time">${flight.departure} - ${flight.arrival}</span>
            <span class="flight-duration">${flight.duration}</span>
          </div>
          <div class="flight-price">$${flight.price}</div>
          <a href="${flight.bookingUrl}" target="_blank" class="book-btn">Book</a>
        </div>
      `;
    });
  }
  
  if (data.hotels && data.hotels.length > 0) {
    html += '<h5>Hotels:</h5>';
    data.hotels.forEach(hotel => {
      html += `
        <div class="hotel-item">
          <div class="hotel-info">
            <strong>${hotel.name}</strong>
            <span class="hotel-rating">⭐ ${hotel.rating}</span>
            <span class="hotel-amenities">${hotel.amenities.join(', ')}</span>
          </div>
          <div class="hotel-price">$${hotel.price}/night</div>
          <a href="${hotel.bookingUrl}" target="_blank" class="book-btn">Book</a>
        </div>
      `;
    });
  }
  
  resultsDiv.innerHTML = html;
};