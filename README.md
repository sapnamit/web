# Smart Assistant Browser 🤖

An open-source browser powered by Electron with an intelligent AI assistant sidebar that helps you shop smarter and travel better!

## Features

### 🌐 Full Web Browser
- Modern, clean interface
- Navigation controls (back, forward, refresh)
- URL bar with search functionality
- Built on Chromium engine via Electron

### 🤖 AI Shopping & Travel Assistant
- **Contextual Awareness**: Automatically detects what website you're on
- **Smart Chat Interface**: Ask questions about products, deals, and travel
- **Price Detection**: Automatically finds and highlights prices on pages
- **Coupon Finder**: Suggests discount codes and deals for popular sites
- **Travel Tips**: Provides booking advice, best times to buy, and savings tips

### 🎯 Three Powerful Tabs

1. **Chat Tab**: Interactive conversation with the assistant
   - Ask about products, prices, coupons, and deals
   - Get personalized recommendations
   - Context-aware responses based on current page

2. **Insights Tab**: Automatic page analysis
   - Price detection and tracking
   - Shopping tips for e-commerce sites
   - Travel booking recommendations
   - Page summary and key information

3. **Deals Tab**: Curated discounts and coupons
   - Site-specific coupon codes
   - Free shipping information
   - Bundle deals and special offers
   - Click to copy coupon codes

### 🛍️ Optimized For Popular Sites
- **Macy's**: Coupons, price tracking, deals
- **Expedia**: Travel deals, bundle savings, booking tips
- **Amazon**: Prime benefits, lightning deals
- **Walmart & Target**: Price matching, clearance alerts
- **Booking.com & Hotels.com**: Best booking times, savings tips

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the browser:
```bash
npm start
```

### Development Mode
To run with developer tools enabled:
```bash
npm run dev
```

## How to Use

### Basic Navigation
1. Enter a URL in the address bar or search for anything
2. Use navigation buttons (◀ ▶ ⟳) to browse
3. Click "🤖 Assistant" to open the AI sidebar

### Using the Assistant

#### For Shopping (Macy's, Amazon, Walmart, etc.)
1. Navigate to any shopping website
2. Open the assistant sidebar
3. Ask questions like:
   - "Are there any coupons available?"
   - "What's the price of this item?"
   - "Tell me about this product"
   - "Any deals or discounts?"

#### For Travel (Expedia, Booking.com, etc.)
1. Browse to a travel website
2. Open the assistant
3. Ask questions like:
   - "When's the best time to book?"
   - "Are there any travel deals?"
   - "Bundle savings options?"
   - "Hotel recommendations?"

#### Using Insights Tab
- Automatically analyzes the current page
- Shows detected prices
- Provides site-specific tips
- Updates as you browse

#### Using Deals Tab
- Shows curated deals for the current site
- Click coupon codes to copy them
- Get free shipping thresholds
- Discover loyalty program benefits

### Tips for Best Results
- ✅ Keep the assistant open while browsing for continuous insights
- ✅ Ask specific questions about what you're looking for
- ✅ Check the Deals tab before checking out
- ✅ Use the chat to compare products or get recommendations
- ✅ Click coupon codes in the Deals tab to copy them instantly

## Architecture

### Tech Stack
- **Electron**: Cross-platform desktop application framework
- **Chromium**: Open-source browser engine (via Electron webview)
- **Node.js**: Backend runtime
- **Vanilla JavaScript**: Frontend logic (no framework dependencies!)
- **CSS3**: Modern, responsive UI design

### File Structure
```
smart-assistant-browser/
├── main.js              # Electron main process
├── index.html           # Browser UI layout
├── styles.css           # UI styling
├── renderer.js          # Browser logic & assistant AI
├── package.json         # Dependencies and scripts
└── README.md           # Documentation
```

### How It Works

1. **Browser Engine**: Uses Electron's `<webview>` tag to embed a full Chromium browser
2. **Content Extraction**: Executes JavaScript in the webview to extract page content
3. **AI Analysis**: Analyzes page content, URL, and structure to provide context
4. **Smart Responses**: Pattern matches user queries to provide relevant information
5. **Real-time Updates**: Continuously monitors page changes and updates insights

## Customization

### Adding New Site Support
Edit `renderer.js` and add your site detection logic:

```javascript
// In analyzeCurrentPage() function
if (domain.includes('yoursite')) {
    addChatMessage(`Custom message for your site!`, 'assistant');
}

// In loadDeals() function
if (domain.includes('yoursite')) {
    deals = `<div class="deal-item">...</div>`;
}
```

### Changing Theme Colors
Edit `styles.css` to customize the color scheme:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Accent colors */
--primary: #667eea;
--success: #48bb78;
--warning: #ed8936;
```

### Extending AI Capabilities
To integrate with actual AI APIs (OpenAI, Claude, etc.):

1. Install the API client:
```bash
npm install openai
# or
npm install @anthropic-ai/sdk
```

2. Update `processUserQuery()` in `renderer.js` to call the API
3. Add your API key to environment variables

## Roadmap

Future enhancements:
- [ ] Integration with OpenAI/Claude for more intelligent responses
- [ ] Price history tracking
- [ ] Product comparison across sites
- [ ] Bookmark and favorites system
- [ ] Tab management
- [ ] Extensions support
- [ ] Ad blocker
- [ ] Privacy mode
- [ ] Multi-language support

## Privacy & Security

- ✅ All browsing happens locally on your machine
- ✅ No data is sent to external servers (unless you browse to them)
- ✅ Page analysis happens client-side
- ✅ No tracking or analytics
- ✅ Open source - audit the code yourself!

**Note**: If you integrate with AI APIs (OpenAI, etc.), data will be sent to those services according to their privacy policies.

## Contributing

This is an open-source project! Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for personal or commercial projects!

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with details
- Include your OS, Node version, and error messages

## Credits

Built with:
- [Electron](https://www.electronjs.org/) - Application framework
- [Chromium](https://www.chromium.org/) - Browser engine

---

**Happy browsing with your AI assistant! 🚀**

*Shop smarter, travel better, save more!*
