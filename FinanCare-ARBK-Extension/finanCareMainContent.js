// This runs in the MAIN world on FinanCare webpage (has access to webpage's localStorage)
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "TO_PAGE_ARBK_BRIDGE_RECEIVE") {
    console.log("ARBK Bridge (Main World): Data received. Writing to localStorage...");
    
    // Save to actual webpage local storage so React components can read it on mount
    localStorage.setItem("arbk_bridge_data", event.data.payload);
    
    // Post event so that already mounted React components can capture it immediately
    window.postMessage({ type: "ARBK_BRIDGE_DATA", payload: event.data.payload }, "*");
  }
});
