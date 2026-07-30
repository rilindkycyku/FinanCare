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
        return;
      }

      // Say which of the two things actually went wrong instead of one catch-all message:
      // either no FinanCare tab is open (or the URL setting doesn't match it), or the tab is
      // open but predates the extension being installed/reloaded and has no bridge in it yet.
      const patterns = (response && response.patterns) || [];
      const listed = patterns.length > 0 ? ` (URL të konfiguruara: ${patterns.join(", ")})` : "";
      const message =
        response && response.reason === "no-content-script"
          ? `FinanCare është e hapur, por skeda duhet rifreskuar që ura të aktivizohet. Rifreskoni skedën e FinanCare dhe provoni sërish.${listed}`
          : `Nuk u gjet asnjë skedë e hapur e FinanCare. Hapeni aplikacionin FinanCare në një skedë tjetër — ose ndryshoni URL-në te ikona e shtesës nëse e përdorni në një adresë tjetër.${listed}`;

      window.postMessage({ type: "ARBK_SEND_STATUS", status: "error", message }, "*");
    });
  }
});
