# Getting Started with Smart Assistant Browser

## Quick Start Guide

### Step 1: Install Dependencies
```bash
cd /workspace
npm install
```

This will install:
- Electron (the browser framework)
- Axios (for future API integrations)

### Step 2: Launch the Browser
```bash
npm start
```

The browser window will open automatically!

### Step 3: Try It Out!

#### Test with Macy's:
1. Type `macys.com` in the URL bar and press Enter
2. Click the "🤖 Assistant" button
3. Wait for the assistant to greet you
4. Try asking: "Are there any coupons?"
5. Click on the "Deals" tab to see available discounts
6. Click on the "Insights" tab to see page analysis

#### Test with Expedia:
1. Navigate to `expedia.com`
2. Open the assistant (if not already open)
3. Ask: "What are some travel deals?"
4. Check the Deals tab for bundle savings
5. Check the Insights tab for booking tips

#### Test with Any Site:
1. Go to any shopping or travel website
2. The assistant adapts to provide relevant help
3. Ask questions in natural language
4. Get instant insights and recommendations

## Features to Try

### 🗨️ Chat with the Assistant
Click on any website and ask:
- "Are there any coupons?"
- "What's the best deal?"
- "Tell me about this product"
- "What are the prices?"
- "Give me a summary"

### 📊 View Insights
- Automatically detects prices on the page
- Shows shopping or travel tips
- Provides page summaries
- Updates as you browse

### 💰 Find Deals
- Curated discount codes
- Free shipping information
- Bundle deal suggestions
- Click-to-copy coupon codes

## Keyboard Shortcuts
- **Enter** in URL bar: Navigate to URL
- **Enter** in chat: Send message
- Navigation buttons: Back, Forward, Refresh

## Tips for Best Experience

1. **Keep Assistant Open**: Leave the sidebar open for continuous insights
2. **Ask Specific Questions**: The more specific, the better the response
3. **Check All Tabs**: Each tab provides different information
4. **Copy Coupons**: Click on coupon codes to copy them instantly
5. **Browse Popular Sites**: Works best on Macy's, Expedia, Amazon, etc.

## Common Use Cases

### Shopping for Clothes on Macy's
1. Navigate to macys.com
2. Search for what you want
3. Open assistant
4. Ask "Any coupons?" or check Deals tab
5. Copy coupon code before checkout

### Booking Travel on Expedia
1. Go to expedia.com
2. Search for your destination
3. Open assistant
4. Check Insights for best booking times
5. Check Deals for bundle savings
6. Ask about specific deals

### General Shopping
1. Visit any e-commerce site
2. Ask about prices, products, or deals
3. Get general shopping tips
4. Find discount strategies

## Troubleshooting

### Browser won't start
- Make sure you ran `npm install` first
- Check that Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

### Assistant not responding
- Make sure the page has finished loading
- Try refreshing the page
- Close and reopen the assistant sidebar

### Webview not loading pages
- Check your internet connection
- Try navigating to a different URL
- Restart the browser

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the browser by editing `styles.css`
- Add your own site support in `renderer.js`
- Integrate with AI APIs for more intelligent responses

## Need Help?

Check the README.md or create an issue on GitHub!

---

**Enjoy your smart browsing experience! 🎉**
