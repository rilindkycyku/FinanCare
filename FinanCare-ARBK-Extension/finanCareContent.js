// This runs in the ISOLATED world on the FinanCare website (has access to chrome extension APIs)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "RECEIVE_ARBK") {
    console.log("ARBK Bridge (Isolated World): Message received from background. Forwarding to main world...");
    
    // Forward payload securely to main world content script via window.postMessage
    window.postMessage({ type: "TO_PAGE_ARBK_BRIDGE_RECEIVE", payload: request.payload }, "*");
    
    sendResponse({ success: true });
  }
});
