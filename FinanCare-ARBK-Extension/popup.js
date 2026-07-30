document.addEventListener('DOMContentLoaded', () => {
  const enableBtn = document.getElementById('enableBtn');
  const fcUrl = document.getElementById('fcUrl');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Comma-separated so one setting can cover a local dev server and the hosted app at the same
  // time — keep this in sync with DEFAULT_FINANCARE_URL in background.js.
  const DEFAULT_FINANCARE_URL = 'localhost,127.0.0.1,financare';

  // Load saved settings
  chrome.storage.sync.get({
    bridgeEnabled: true,
    finanCareUrl: DEFAULT_FINANCARE_URL
  }, (items) => {
    enableBtn.checked = items.bridgeEnabled;
    // Installs from before the default covered the hosted app would otherwise stay stuck on
    // "localhost" alone and never match financare.* — top those up to the new default.
    fcUrl.value = items.finanCareUrl === 'localhost' ? DEFAULT_FINANCARE_URL : items.finanCareUrl;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      bridgeEnabled: enableBtn.checked,
      finanCareUrl: fcUrl.value.trim() || DEFAULT_FINANCARE_URL
    }, () => {
      status.style.display = 'block';
      setTimeout(() => status.style.display = 'none', 3000);
    });
  });
});
