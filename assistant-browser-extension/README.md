# Open Assistant Sidebar (Browser Extension)

A Manifest V3 browser extension that injects an AI assistant sidebar on any website (e.g., `macys.com`, `expedia.com`). The assistant can chat about products, coupons, and travel.

## Features
- Toggleable right-side sidebar injected on any page
- Popup button and keyboard shortcut (Alt+Shift+A)
- Options page to configure local Ollama model (default)
- Basic page context detection to inform responses

## Quick Start (Chrome/Edge/Brave)
1. Build not required; load unpacked directly.
2. Go to `chrome://extensions` → toggle Developer mode → Load unpacked → select the `assistant-browser-extension` folder.
3. Pin the extension and click the toolbar icon or press Alt+Shift+A to toggle the sidebar.
4. Optional: Open Options to set your Ollama endpoint/model.

## Firefox (MV3 preview)
- Open `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json`.
- Some MV3 APIs are still stabilizing; functionality may vary.

## Local Model (Ollama)
- Install: https://ollama.ai
- Run: `ollama serve` then `ollama pull llama3.1`
- Default endpoint: `http://localhost:11434`

## Privacy
- All logic runs locally in the browser; model calls go only to the endpoint you configure.

## Folder Structure
- `background/` service worker and bridge
- `content/` content script to inject/toggle the sidebar
- `sidebar/` UI (iframe)
- `options/` options page
- `popup/` toolbar popup

## Roadmap
- Domain-specific scrapers for Macy's and Expedia
- Built-in coupon fetchers and travel planners
- Support for more model providers (OpenAI, Claude, Gemini)
- Streaming responses and RAG

## License
MIT