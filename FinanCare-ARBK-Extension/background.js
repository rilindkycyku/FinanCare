chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SEND_TO_FINANCARE") {
    
    // Get target URL from settings
    chrome.storage.sync.get({ finanCareUrl: 'localhost' }, (items) => {
      const targetUrl = items.finanCareUrl.toLowerCase();
      
      // Find FinanCare tabs
      chrome.tabs.query({}, (tabs) => {
        const fcTabs = tabs.filter(t => t.url && t.url.toLowerCase().includes(targetUrl));
        
        if (fcTabs.length > 0) {
          // Send to all matching tabs
          fcTabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: "RECEIVE_ARBK", payload: request.payload }).catch(() => {});
          });
          
          // Focus the first matching tab
          chrome.tabs.update(fcTabs[0].id, { active: true });
          chrome.windows.update(fcTabs[0].windowId, { focused: true });
          
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
      });
    });
    
    return true; // async response
  }
});
