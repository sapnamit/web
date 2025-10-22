// Background service worker for Smart Shopping Assistant
class ShoppingAssistant {
  constructor() {
    this.priceAPIs = {
      // Free price comparison APIs
      'rapidapi': 'https://real-time-product-search.p.rapidapi.com/search',
      'serpapi': 'https://serpapi.com/search.json',
      'scrapingbee': 'https://app.scrapingbee.com/api/v1/'
    };
    
    this.couponAPIs = {
      'retailmenot': 'https://api.retailmenot.com/v1/',
      'honey': 'https://api.joinhoney.com/v1/',
      'coupons': 'https://api.coupons.com/v1/'
    };
    
    this.travelAPIs = {
      'skyscanner': 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/',
      'amadeus': 'https://api.amadeus.com/v1/',
      'expedia': 'https://api.expedia.com/v1/'
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Listen for tab updates to detect page changes
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.analyzePage(tabId, tab.url);
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getProductPrices':
          const prices = await this.getProductPrices(request.productInfo);
          sendResponse({ success: true, data: prices });
          break;
          
        case 'getCoupons':
          const coupons = await this.getCoupons(request.storeInfo);
          sendResponse({ success: true, data: coupons });
          break;
          
        case 'applyCoupon':
          const result = await this.applyCoupon(request.couponCode, request.storeInfo);
          sendResponse({ success: true, data: result });
          break;
          
        case 'searchTravel':
          const travelResults = await this.searchTravel(request.travelInfo);
          sendResponse({ success: true, data: travelResults });
          break;
          
        case 'analyzePage':
          const analysis = await this.analyzePage(sender.tab.id, sender.tab.url);
          sendResponse({ success: true, data: analysis });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async analyzePage(tabId, url) {
    const domain = new URL(url).hostname;
    const pageType = this.detectPageType(domain, url);
    
    return {
      domain,
      pageType,
      timestamp: Date.now()
    };
  }

  detectPageType(domain, url) {
    const shoppingSites = ['amazon.com', 'walmart.com', 'target.com', 'bestbuy.com', 'macys.com', 'ebay.com'];
    const travelSites = ['expedia.com', 'booking.com', 'kayak.com', 'priceline.com', 'hotels.com'];
    
    if (shoppingSites.some(site => domain.includes(site))) {
      return 'shopping';
    } else if (travelSites.some(site => domain.includes(site))) {
      return 'travel';
    } else if (url.includes('/checkout') || url.includes('/cart')) {
      return 'checkout';
    }
    
    return 'general';
  }

  async getProductPrices(productInfo) {
    try {
      // Extract product details
      const { name, brand, model, currentPrice, imageUrl } = productInfo;
      
      // Search for prices across multiple sources
      const pricePromises = [
        this.searchAmazon(name, brand, model),
        this.searchWalmart(name, brand, model),
        this.searchTarget(name, brand, model),
        this.searchBestBuy(name, brand, model),
        this.searchEbay(name, brand, model)
      ];
      
      const results = await Promise.allSettled(pricePromises);
      const prices = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        .flat()
        .filter(price => price && price.price > 0);
      
      // Sort by price
      prices.sort((a, b) => a.price - b.price);
      
      return {
        product: productInfo,
        prices,
        savings: this.calculateSavings(currentPrice, prices),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting product prices:', error);
      return { error: error.message };
    }
  }

  async searchAmazon(productName, brand, model) {
    // Simulate API call - in real implementation, use actual Amazon API or web scraping
    return [
      {
        store: 'Amazon',
        price: Math.floor(Math.random() * 200) + 50,
        url: `https://amazon.com/s?k=${encodeURIComponent(productName)}`,
        rating: 4.2 + Math.random() * 0.8,
        availability: 'In Stock',
        shipping: 'Free Prime'
      }
    ];
  }

  async searchWalmart(productName, brand, model) {
    return [
      {
        store: 'Walmart',
        price: Math.floor(Math.random() * 200) + 45,
        url: `https://walmart.com/search?q=${encodeURIComponent(productName)}`,
        rating: 4.0 + Math.random() * 0.8,
        availability: 'In Stock',
        shipping: 'Free 2-day shipping'
      }
    ];
  }

  async searchTarget(productName, brand, model) {
    return [
      {
        store: 'Target',
        price: Math.floor(Math.random() * 200) + 55,
        url: `https://target.com/s?searchTerm=${encodeURIComponent(productName)}`,
        rating: 4.1 + Math.random() * 0.8,
        availability: 'In Stock',
        shipping: 'Free shipping on orders $35+'
      }
    ];
  }

  async searchBestBuy(productName, brand, model) {
    return [
      {
        store: 'Best Buy',
        price: Math.floor(Math.random() * 200) + 60,
        url: `https://bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`,
        rating: 4.3 + Math.random() * 0.7,
        availability: 'In Stock',
        shipping: 'Free shipping on orders $35+'
      }
    ];
  }

  async searchEbay(productName, brand, model) {
    return [
      {
        store: 'eBay',
        price: Math.floor(Math.random() * 200) + 40,
        url: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(productName)}`,
        rating: 4.0 + Math.random() * 0.8,
        availability: 'Multiple sellers',
        shipping: 'Varies by seller'
      }
    ];
  }

  calculateSavings(currentPrice, prices) {
    if (!currentPrice || prices.length === 0) return null;
    
    const lowestPrice = Math.min(...prices.map(p => p.price));
    const savings = currentPrice - lowestPrice;
    const savingsPercent = (savings / currentPrice) * 100;
    
    return {
      amount: savings,
      percent: savingsPercent,
      lowestPrice,
      currentPrice
    };
  }

  async getCoupons(storeInfo) {
    try {
      const { domain, storeName, cartValue } = storeInfo;
      
      // Simulate coupon search - in real implementation, use actual coupon APIs
      const coupons = [
        {
          code: 'SAVE20',
          description: '20% off your order',
          discount: '20%',
          minOrder: 50,
          expires: '2024-12-31',
          category: 'general'
        },
        {
          code: 'FREESHIP',
          description: 'Free shipping on orders over $35',
          discount: 'Free shipping',
          minOrder: 35,
          expires: '2024-12-31',
          category: 'shipping'
        },
        {
          code: 'WELCOME10',
          description: '$10 off your first order',
          discount: '$10',
          minOrder: 25,
          expires: '2024-12-31',
          category: 'first-time'
        }
      ];
      
      // Filter coupons based on cart value
      const applicableCoupons = coupons.filter(coupon => 
        !coupon.minOrder || cartValue >= coupon.minOrder
      );
      
      return {
        store: storeName,
        coupons: applicableCoupons,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting coupons:', error);
      return { error: error.message };
    }
  }

  async applyCoupon(couponCode, storeInfo) {
    try {
      // Simulate coupon application
      // In real implementation, this would interact with the checkout page
      return {
        success: true,
        message: `Coupon ${couponCode} applied successfully!`,
        discount: this.calculateDiscount(couponCode, storeInfo.cartValue)
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to apply coupon: ${error.message}`
      };
    }
  }

  calculateDiscount(couponCode, cartValue) {
    // Simulate discount calculation
    if (couponCode === 'SAVE20') {
      return cartValue * 0.2;
    } else if (couponCode === 'FREESHIP') {
      return 5.99; // Typical shipping cost
    } else if (couponCode === 'WELCOME10') {
      return Math.min(10, cartValue);
    }
    return 0;
  }

  async searchTravel(travelInfo) {
    try {
      const { origin, destination, departureDate, returnDate, passengers } = travelInfo;
      
      // Simulate travel search - in real implementation, use actual travel APIs
      const flights = [
        {
          airline: 'American Airlines',
          price: 299 + Math.floor(Math.random() * 200),
          departure: '08:00 AM',
          arrival: '11:30 AM',
          duration: '3h 30m',
          stops: 'Non-stop',
          bookingUrl: 'https://aa.com'
        },
        {
          airline: 'Delta',
          price: 325 + Math.floor(Math.random() * 150),
          departure: '10:15 AM',
          arrival: '01:45 PM',
          duration: '3h 30m',
          stops: 'Non-stop',
          bookingUrl: 'https://delta.com'
        },
        {
          airline: 'United',
          price: 275 + Math.floor(Math.random() * 100),
          departure: '02:30 PM',
          arrival: '06:00 PM',
          duration: '3h 30m',
          stops: 'Non-stop',
          bookingUrl: 'https://united.com'
        }
      ];
      
      const hotels = [
        {
          name: 'Marriott Downtown',
          price: 150 + Math.floor(Math.random() * 100),
          rating: 4.5,
          amenities: ['WiFi', 'Pool', 'Gym'],
          bookingUrl: 'https://marriott.com'
        },
        {
          name: 'Hilton Garden Inn',
          price: 120 + Math.floor(Math.random() * 80),
          rating: 4.2,
          amenities: ['WiFi', 'Breakfast', 'Parking'],
          bookingUrl: 'https://hilton.com'
        }
      ];
      
      return {
        search: travelInfo,
        flights: flights.sort((a, b) => a.price - b.price),
        hotels: hotels.sort((a, b) => a.price - b.price),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error searching travel:', error);
      return { error: error.message };
    }
  }
}

// Initialize the shopping assistant
const shoppingAssistant = new ShoppingAssistant();