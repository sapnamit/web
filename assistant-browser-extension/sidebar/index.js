/* eslint-disable no-undef */
const conversation = document.getElementById('conversation');
const form = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt');
const tabProducts = document.getElementById('tab-products');
const tabCoupons = document.getElementById('tab-coupons');
const tabTravel = document.getElementById('tab-travel');

let currentTab = 'products';
let lastContext = { hostname: '', text: '', url: '', selection: '' };

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  conversation.appendChild(div);
  conversation.scrollTop = conversation.scrollHeight;
}

function showThinking() {
  const div = document.createElement('div');
  div.className = 'message';
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  div.appendChild(spinner);
  conversation.appendChild(div);
  conversation.scrollTop = conversation.scrollHeight;
  return () => div.remove();
}

async function getOptions() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_OPTIONS' }, (res) => {
      resolve(res?.data || {});
    });
  });
}

function detectContext() {
  // Prefer context sent from content script postMessage
  if (lastContext && (lastContext.hostname || lastContext.url)) return lastContext;
  const url = new URL(document.referrer || 'https://example.com');
  const hostname = url.hostname;
  const text = document.title;
  return { hostname, text };
}

async function callModel({ prompt, tab }) {
  const options = await getOptions();
  const provider = options.provider || 'ollama';
  const model = options.model || 'llama3.1:8b';
  const endpoint = options.endpoint || 'http://localhost:11434';

  const system = `You are a helpful shopping and travel assistant. Tab: ${tab}. Keep replies concise.`;
  try {
    if (provider === 'ollama') {
      const res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${system}\n\nUser: ${prompt}\nAssistant:`,
          stream: false
        })
      });
      if (!res.ok) throw new Error('Model error');
      const data = await res.json();
      return data.response?.trim() || 'No response';
    }
    return 'Provider not configured';
  } catch (e) {
    return `Error contacting model: ${e.message}`;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;
  promptInput.value = '';
  addMessage('user', text);
  const stop = showThinking();
  const context = detectContext();
  const response = await callModel({ prompt: `${text}\nContext: ${JSON.stringify(context)}`, tab: currentTab });
  stop();
  addMessage('assistant', response);
});

function setTab(tab) {
  currentTab = tab;
}

tabProducts.addEventListener('click', () => setTab('products'));

tabCoupons.addEventListener('click', () => setTab('coupons'));

tabTravel.addEventListener('click', () => setTab('travel'));

addMessage('assistant', 'Ask me about products, coupons, or travel on this page.');

// Receive context from the host page
window.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'ASSISTANT_CONTEXT' && data.context) {
    lastContext = data.context;
  }
});
