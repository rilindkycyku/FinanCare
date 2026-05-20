// This runs in the ISOLATED world on the ARBK website (has access to chrome extension APIs)
chrome.storage.sync.get({ bridgeEnabled: true }, (items) => {
  // Tell main world content script whether the bridge is enabled
  window.postMessage({ type: "INIT_ARBK_BRIDGE_CONFIG", enabled: items.bridgeEnabled }, "*");
});

// Listen for state extraction events from the main world script
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FROM_PAGE_ARBK_STATE") {
    const data = event.data.payload;
    
    // Notify main world that we started sending
    window.postMessage({ type: "ARBK_SEND_STATUS", status: "sending" }, "*");
    
    // Send payload to background service worker
    chrome.runtime.sendMessage({ action: "SEND_TO_FINANCARE", payload: data }, (response) => {
      if (response && response.success) {
        // Send success signal to main world button UI
        window.postMessage({ type: "ARBK_SEND_STATUS", status: "success" }, "*");
      } else {
        // Send error signal to main world button UI
        window.postMessage({
          type: "ARBK_SEND_STATUS",
          status: "error",
          message: "Gabim! Sigurohuni që keni hapur aplikacionin FinanCare dhe keni hapur dialogun 'Shto Partnerin'."
        }, "*");
      }
    });
  }
});
