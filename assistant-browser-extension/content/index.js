/* eslint-disable no-undef */
(function initContentScript() {
  const SIDEBAR_ID = 'open-assistant-sidebar-root';
  const IFRAME_ID = 'open-assistant-sidebar-frame';

  function ensureStyles() {
    if (document.getElementById('open-assistant-sidebar-style')) return;
    const style = document.createElement('style');
    style.id = 'open-assistant-sidebar-style';
    style.textContent = `
      #${SIDEBAR_ID} { position: fixed; top: 0; right: 0; height: 100vh; width: 0; z-index: 2147483647; transition: width 0.2s ease-in-out; }
      #${SIDEBAR_ID}.open { width: min(420px, 35vw); }
      #${SIDEBAR_ID} iframe { border: 0; width: 100%; height: 100%; box-shadow: rgba(0, 0, 0, 0.2) -4px 0 16px; background: #111; }
      .open-assistant-sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.1); backdrop-filter: blur(0px); z-index: 2147483646; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
      .open-assistant-sidebar-backdrop.open { opacity: 1; pointer-events: auto; }
    `;
    document.documentElement.appendChild(style);
  }

  function injectSidebar() {
    ensureStyles();
    if (document.getElementById(SIDEBAR_ID)) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'open-assistant-sidebar-backdrop';
    backdrop.addEventListener('click', toggleSidebar);

    const root = document.createElement('div');
    root.id = SIDEBAR_ID;

    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.src = chrome.runtime.getURL('sidebar/index.html');

    root.appendChild(iframe);
    document.documentElement.appendChild(backdrop);
    document.documentElement.appendChild(root);
  }

  function openSidebar() {
    injectSidebar();
    document.querySelector('.open-assistant-sidebar-backdrop')?.classList.add('open');
    document.getElementById(SIDEBAR_ID)?.classList.add('open');

    // send page context to iframe when opened
    const iframe = document.getElementById(IFRAME_ID);
    if (iframe && iframe.contentWindow) {
      try {
        const context = {
          url: location.href,
          title: document.title,
          hostname: location.hostname,
          selection: window.getSelection()?.toString() || ''
        };
        iframe.contentWindow.postMessage({ type: 'ASSISTANT_CONTEXT', context }, '*');
      } catch (_) {}
    }
  }

  function closeSidebar() {
    document.querySelector('.open-assistant-sidebar-backdrop')?.classList.remove('open');
    document.getElementById(SIDEBAR_ID)?.classList.remove('open');
  }

  function toggleSidebar() {
    const el = document.getElementById(SIDEBAR_ID);
    if (!el || !el.classList.contains('open')) {
      openSidebar();
    } else {
      closeSidebar();
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'ASSISTANT_TOGGLE') {
      toggleSidebar();
    }
  });

  // Add a floating toggle button on pages without action access
  function addFloatingButton() {
    if (document.getElementById('open-assistant-toggle-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'open-assistant-toggle-btn';
    btn.textContent = 'Assistant';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '16px', right: '16px', zIndex: 2147483647,
      padding: '10px 12px', borderRadius: '999px', border: '1px solid #555',
      background: '#111', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    });
    btn.addEventListener('click', toggleSidebar);
    document.documentElement.appendChild(btn);
  }

  injectSidebar();
  addFloatingButton();
})();
