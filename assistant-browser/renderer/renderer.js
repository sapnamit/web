const webview = document.getElementById('webview');
const urlInput = document.getElementById('url');
const goBtn = document.getElementById('go');
const backBtn = document.getElementById('back');
const forwardBtn = document.getElementById('forward');
const reloadBtn = document.getElementById('reload');
const outputEl = document.getElementById('assistant-output');
const inputEl = document.getElementById('assistant-input');
const sendBtn = document.getElementById('assistant-send');
const quickActions = document.querySelector('.quick-actions');

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `<span class="role">${role === 'user' ? 'You' : 'Assistant'}:</span> ${text}`;
  outputEl.appendChild(div);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function normalizeUrl(raw) {
  try {
    const withProto = raw.match(/^https?:\/\//i) ? raw : `https://${raw}`;
    return new URL(withProto).toString();
  } catch (_) { return raw; }
}

function detectDomainKind(hostname) {
  if (!hostname) return 'generic';
  if (hostname.includes('macys')) return 'retail';
  if (hostname.includes('expedia') || hostname.includes('booking') || hostname.includes('airbnb')) return 'travel';
  return 'generic';
}

// Inject content script into webview to extract structured context
async function getPageContext() {
  if (!webview || !webview.executeJavaScript) return { kind: 'generic', url: '', title: document.title };
  const code = `(() => {
    function text(el) { return (el?.textContent || '').trim(); }
    function numberFromText(t) { const n = (t.match(/([0-9]+[.,]?[0-9]*)/)||[])[1]; return n ? parseFloat(n.replace(',','')) : null; }
    const url = location.href;
    const title = document.title;
    const host = location.hostname;
    const kind = (host.includes('macys')) ? 'retail' : (host.includes('expedia')||host.includes('booking')||host.includes('airbnb')) ? 'travel' : 'generic';

    const context = { kind, url, title, host };

    if (kind === 'retail') {
      const productCards = [...document.querySelectorAll('[data-product-id], article, li, div')].slice(0, 40);
      const products = productCards.map(card => {
        const name = text(card.querySelector('h1, h2, h3, [data-el=productTitle], [data-test=product-title]')) || text(document.querySelector('h1'));
        const priceText = text(card.querySelector('[data-test=price], .price, [data-el=price]')) || text(document.querySelector('.price'));
        const price = numberFromText(priceText);
        const img = card.querySelector('img')?.src || document.querySelector('img')?.src || '';
        return name ? { name, price, priceText, img } : null;
      }).filter(Boolean);

      const coupons = [...document.querySelectorAll('[class*="coupon" i], [id*="coupon" i], [class*="promo" i], [id*="promo" i]')]
        .map(el => text(el)).filter(Boolean).slice(0, 20);

      Object.assign(context, { products, coupons });
    }

    if (kind === 'travel') {
      const items = [...document.querySelectorAll('[data-stid], article, li, div')].slice(0, 40);
      const listings = items.map(el => {
        const name = text(el.querySelector('h1, h2, h3, [data-stid*="title"]')) || text(document.querySelector('h1'));
        const priceText = text(el.querySelector('[data-stid*="price"], .price'));
        const price = numberFromText(priceText);
        const ratingText = text(el.querySelector('[aria-label*="rating" i], [class*="rating" i]'));
        const img = el.querySelector('img')?.src || '';
        return name ? { name, price, priceText, ratingText, img } : null;
      }).filter(Boolean);

      const coupons = [...document.querySelectorAll('[class*="coupon" i], [id*="coupon" i], [class*="deal" i], [id*="deal" i], [class*="promo" i]')]
        .map(el => text(el)).filter(Boolean).slice(0, 20);

      Object.assign(context, { listings, coupons });
    }

    return context;
  })();`;
  try {
    const result = await webview.executeJavaScript(code, true);
    return result;
  } catch (e) {
    return { kind: 'generic', url: webview.getURL?.() || '', title: document.title, error: String(e) };
  }
}

async function askAssistant(prompt) {
  const page = await getPageContext();
  const system = `You are a helpful shopping and travel assistant inside a web browser. You can see a structured snapshot of the current page with kind (retail | travel | generic), products/listings, coupons, and metadata. Be concise, cite found items when useful.`;
  const messages = [
    { role: 'user', content: `Current page context (JSON): ${JSON.stringify(page).slice(0, 12000)}` },
    { role: 'user', content: prompt }
  ];
  const { ok, response, error } = await window.assistantAPI.chat({ system, messages });
  if (!ok) throw new Error(error || 'Assistant failed');
  return response;
}

function navigate() {
  const raw = urlInput.value.trim();
  if (!raw) return;
  webview.src = normalizeUrl(raw);
}

backBtn.addEventListener('click', () => webview.canGoBack() && webview.goBack());
forwardBtn.addEventListener('click', () => webview.canGoForward() && webview.goForward());
reloadBtn.addEventListener('click', () => webview.reload());
goBtn.addEventListener('click', navigate);
urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });

sendBtn.addEventListener('click', async () => {
  const prompt = inputEl.value.trim();
  if (!prompt) return;
  appendMessage('user', prompt);
  inputEl.value = '';
  try {
    const answer = await askAssistant(prompt);
    appendMessage('assistant', answer);
  } catch (e) {
    appendMessage('assistant', `Error: ${e.message}`);
  }
});

quickActions.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  let prompt = '';
  if (btn.dataset.action === 'summarize') prompt = 'Summarize the main items and prices on this page.';
  if (btn.dataset.action === 'coupons') prompt = 'Find and list any coupons or promo codes mentioned.';
  if (btn.dataset.action === 'deals') prompt = 'List top 5 value deals with brief rationale.';
  if (btn.dataset.action === 'itinerary') prompt = 'For a 3-day trip here, sketch a concise itinerary with costs.';
  if (!prompt) return;
  appendMessage('user', `[Quick Action] ${btn.textContent}`);
  try {
    const answer = await askAssistant(prompt);
    appendMessage('assistant', answer);
  } catch (e) {
    appendMessage('assistant', `Error: ${e.message}`);
  }
});

webview.addEventListener('did-navigate', () => {
  urlInput.value = webview.getURL();
});
webview.addEventListener('did-navigate-in-page', () => {
  urlInput.value = webview.getURL();
});
