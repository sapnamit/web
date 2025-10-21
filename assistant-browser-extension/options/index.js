/* eslint-disable no-undef */
const provider = document.getElementById('provider');
const endpoint = document.getElementById('endpoint');
const model = document.getElementById('model');
const save = document.getElementById('save');
const statusEl = document.getElementById('status');

function showStatus(text) { statusEl.textContent = text; setTimeout(()=> statusEl.textContent='', 1500); }

function restore() {
  chrome.storage.sync.get(['provider','endpoint','model'], (items) => {
    provider.value = items.provider || 'ollama';
    endpoint.value = items.endpoint || 'http://localhost:11434';
    model.value = items.model || 'llama3.1:8b';
  });
}

save.addEventListener('click', () => {
  chrome.storage.sync.set({
    provider: provider.value,
    endpoint: endpoint.value,
    model: model.value
  }, () => showStatus('Saved'));
});

document.addEventListener('DOMContentLoaded', restore);
