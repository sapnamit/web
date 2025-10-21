/* eslint-disable no-undef */
// Background service worker (MV3)
// - Handles toggle command and popup requests
// - Manages messaging bridge

chrome.runtime.onInstalled.addListener(() => {
  console.log('Open Assistant Sidebar installed');
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-assistant') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'ASSISTANT_TOGGLE' });
  } catch (err) {
    // content script might not be injected yet on some pages; try injecting
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/index.js']
      });
      await chrome.tabs.sendMessage(tab.id, { type: 'ASSISTANT_TOGGLE' });
    } catch (e) {
      console.warn('Failed to toggle assistant', e);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'GET_OPTIONS') {
    chrome.storage.sync.get(null, (items) => {
      sendResponse({ ok: true, data: items || {} });
    });
    return true; // async
  }
  return false;
});
