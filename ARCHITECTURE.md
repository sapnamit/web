# Browser Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Smart Assistant Browser                      │
│                        (Electron App)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
            ┌─────────────────┴──────────────────┐
            │                                    │
            ▼                                    ▼
    ┌───────────────┐                  ┌─────────────────┐
    │  Main Process │                  │ Renderer Process │
    │   (main.js)   │◄────IPC─────────►│ (renderer.js)   │
    └───────────────┘                  └─────────────────┘
            │                                    │
            │                                    │
            ▼                                    ▼
    ┌───────────────┐                  ┌─────────────────┐
    │   Window      │                  │   UI Components │
    │  Management   │                  │  - Navigation   │
    │   - Create    │                  │  - Webview      │
    │   - Controls  │                  │  - Assistant    │
    └───────────────┘                  └─────────────────┘
```

## Component Breakdown

### 1. Main Process (main.js)
**Role**: Application lifecycle and window management

**Responsibilities**:
- Initialize Electron app
- Create browser window
- Configure webview settings
- Handle IPC communication
- Manage application events

**Key Code**:
```javascript
- createWindow() → Initialize browser UI
- IPC handlers → Communication with renderer
- App lifecycle → Ready, activate, close
```

---

### 2. Renderer Process (renderer.js)
**Role**: Browser logic and AI assistant

**Responsibilities**:
- Navigation controls
- Webview management
- Content extraction
- Assistant logic
- User interaction handling

**Key Functions**:
```javascript
- navigateToUrl() → Handle URL navigation
- extractPageContent() → Pull data from webview
- processUserQuery() → AI response generation
- analyzeCurrentPage() → Site detection
- loadInsights() → Generate page insights
- loadDeals() → Curate discount codes
```

---

### 3. UI Layer (index.html + styles.css)
**Role**: User interface and visual design

**Components**:

#### Navigation Bar
```
┌────────────────────────────────────────────────────┐
│ ◀ ▶ ⟳  │  [URL Bar]           │  Go  │  🤖        │
└────────────────────────────────────────────────────┘
```

#### Main View
```
┌──────────────────────┬─────────────────────────┐
│                      │  🤖 Smart Assistant     │
│                      │  ─────────────────────  │
│   Browser Webview    │  [Chat][Insights][Deals]│
│   (Full Chromium)    │                         │
│                      │  [Assistant Content]    │
│                      │                         │
│                      │  [Chat Input]    [Send] │
└──────────────────────┴─────────────────────────┘
```

---

## Data Flow

### 1. Page Navigation Flow
```
User enters URL
      │
      ▼
navigateToUrl()
      │
      ▼
Webview loads page
      │
      ▼
'did-stop-loading' event
      │
      ▼
extractPageContent()
      │
      ▼
Execute JavaScript in webview
      │
      ▼
Extract: title, text, prices, headings
      │
      ▼
Store in pageContent variable
      │
      ▼
analyzeCurrentPage()
      │
      ▼
Detect site type
      │
      ▼
Show welcome message
```

### 2. Chat Interaction Flow
```
User types message
      │
      ▼
sendMessage()
      │
      ▼
Add to chat UI
      │
      ▼
processUserQuery()
      │
      ▼
Analyze query keywords
      │
      ▼
Check pageContent
      │
      ▼
Generate contextual response
      │
      ├─ Coupon query → generateCouponResponse()
      ├─ Price query → generatePriceResponse()
      ├─ Product query → generateProductResponse()
      └─ Travel query → generateTravelResponse()
      │
      ▼
Display response in chat
```

### 3. Insights Generation Flow
```
User opens Insights tab
      │
      ▼
loadInsights()
      │
      ▼
Check pageContent
      │
      ▼
Extract domain & title
      │
      ▼
Find prices (regex)
      │
      ▼
Detect site type
      │
      ├─ Shopping site → Add shopping tips
      └─ Travel site → Add travel tips
      │
      ▼
Build HTML insights
      │
      ▼
Display in Insights tab
```

---

## Content Extraction System

### Webview JavaScript Execution
```javascript
webview.executeJavaScript(`
    (function() {
        return JSON.stringify({
            title: document.title,
            url: window.location.href,
            domain: window.location.hostname,
            text: document.body.innerText,
            headings: [...document.querySelectorAll('h1,h2,h3')],
            images: [...document.querySelectorAll('img')],
            links: [...document.querySelectorAll('a')]
        });
    })();
`)
```

### Data Structure
```javascript
pageContent = {
    title: "Product Name - Macy's",
    url: "https://www.macys.com/product/...",
    domain: "www.macys.com",
    text: "Product description...",
    headings: ["Main Title", "Description", ...],
    images: ["alt text", "product.jpg", ...],
    links: [
        { text: "Buy Now", href: "..." },
        ...
    ]
}
```

---

## AI Response System

### Pattern Matching Engine
```
User Query → Lowercase → Keyword Detection → Response Generator
```

**Keyword Categories**:
1. **Coupon Keywords**: coupon, discount, deal, promo, code
2. **Price Keywords**: price, cost, cheap, expensive, how much
3. **Product Keywords**: product, item, details, info, about
4. **Travel Keywords**: travel, hotel, flight, booking, trip

### Site-Specific Knowledge Base

**Macy's**:
- Common codes: SAVE, FRIEND, SALE
- Email signup: 25% off
- Free shipping: $25+
- Star Rewards program

**Expedia**:
- Bundle savings: up to 30%
- Member pricing: ~10% off
- Best booking: Sundays for flights
- Mobile app discounts

**General Shopping**:
- Email signup discounts
- Cart abandonment codes
- Seasonal sales
- Price matching policies

---

## UI State Management

### Sidebar Toggle
```javascript
toggleAssistant() {
    sidebar.classList.toggle('active')
    // CSS handles animation
}
```

### Tab System
```javascript
switchTab(tabName) {
    // Update button states
    // Show/hide content
    // Load tab-specific data
}
```

### Message Display
```javascript
addChatMessage(message, type) {
    // Create message element
    // Add to chat container
    // Auto-scroll to bottom
    // Animate entry
}
```

---

## Real-Time Features

### Auto-Refresh System
```javascript
setInterval(() => {
    if (sidebar is open) {
        if (insights tab active) {
            loadInsights()
        }
        if (deals tab active) {
            loadDeals()
        }
    }
}, 5000) // Every 5 seconds
```

### Event Listeners
```javascript
// Navigation events
webview.on('did-start-loading')
webview.on('did-stop-loading')
webview.on('did-navigate')
webview.on('did-navigate-in-page')
webview.on('new-window')
webview.on('dom-ready')
```

---

## Security & Permissions

### Webview Configuration
```javascript
webPreferences: {
    nodeIntegration: true,      // Node.js in renderer
    contextIsolation: false,    // Share context
    webviewTag: true,           // Enable webview
    enableRemoteModule: true    // Remote module access
}
```

### Content Security
- JavaScript execution sandboxed in webview
- No eval() or unsafe code
- Popup handling
- Session persistence

---

## Performance Optimizations

1. **Content Extraction**:
   - Limited to 5000 characters
   - Top 20 headings only
   - Top 10 images
   - Runs after page load

2. **UI Updates**:
   - CSS transitions for smooth animations
   - Auto-scroll optimization
   - Event delegation

3. **Memory Management**:
   - Single webview instance
   - Cleanup on navigation
   - Efficient DOM manipulation

---

## Extension Points

### Add New AI Provider
```javascript
// In processUserQuery()
async function callOpenAI(query, context) {
    // Integrate OpenAI API
    // Pass pageContent as context
    // Return AI response
}
```

### Add New Site Support
```javascript
// In analyzeCurrentPage()
if (domain.includes('newsite')) {
    addChatMessage('Custom greeting', 'assistant')
}

// In loadDeals()
if (domain.includes('newsite')) {
    deals = `<div class="deal-item">...</div>`
}
```

### Add New Features
1. Price history: Track prices over time
2. Product comparison: Compare across sites
3. Bookmarks: Save favorite pages
4. Notes: Annotate products

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Application Framework | Electron 27 | Desktop app wrapper |
| Browser Engine | Chromium | Web rendering |
| Backend Runtime | Node.js | Server-side logic |
| UI Framework | Vanilla JS | No dependencies |
| Styling | CSS3 | Modern design |
| Data Format | JSON | Content structure |
| IPC | Electron IPC | Process communication |

---

## File Dependencies

```
main.js
  ├─ Requires: electron
  └─ Loads: index.html

index.html
  ├─ Loads: styles.css
  └─ Loads: renderer.js

renderer.js
  ├─ Requires: electron (ipcRenderer)
  ├─ DOM: index.html elements
  └─ Controls: webview

package.json
  ├─ Defines: electron dependency
  └─ Scripts: start, dev
```

---

## Deployment Architecture

```
Development:
  npm run dev → Electron with DevTools

Production:
  npm start → Electron in production mode

Future Packaging:
  electron-builder → .exe, .dmg, .AppImage
```

---

This architecture provides a solid foundation for a feature-rich, extensible browser with AI capabilities while maintaining simplicity and performance.
