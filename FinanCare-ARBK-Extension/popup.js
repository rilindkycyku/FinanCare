document.addEventListener('DOMContentLoaded', () => {
  const enableBtn = document.getElementById('enableBtn');
  const fcUrl = document.getElementById('fcUrl');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get({
    bridgeEnabled: true,
    finanCareUrl: 'localhost'
  }, (items) => {
    enableBtn.checked = items.bridgeEnabled;
    fcUrl.value = items.finanCareUrl;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      bridgeEnabled: enableBtn.checked,
      finanCareUrl: fcUrl.value.trim() || 'localhost'
    }, () => {
      status.style.display = 'block';
      setTimeout(() => status.style.display = 'none', 3000);
    });
  });
});
