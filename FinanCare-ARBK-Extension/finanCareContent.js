// This runs on FinanCare localhost
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "RECEIVE_ARBK") {
    console.log("ARBK Bridge: Data received in content script. Forwarding to FinanCare React app...");
    // Save to local storage as a fallback in case the modal is not open yet
    localStorage.setItem("arbk_bridge_data", request.payload);
    
    // Also send immediate event if the modal is already open
    window.postMessage({ type: "ARBK_BRIDGE_DATA", payload: request.payload }, "*");
  }
});
