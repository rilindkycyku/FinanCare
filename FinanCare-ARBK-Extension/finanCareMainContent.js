// This runs in the MAIN world on FinanCare webpage (has access to webpage's localStorage)
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "TO_PAGE_ARBK_BRIDGE_RECEIVE") {
    console.log("ARBK Bridge (Main World): Data received. Writing to localStorage...");
    
    // Save to actual webpage local storage so React components can read it on mount. The
    // timestamp lets FinanCare tell a hand-off it's meant to pick up right now from a leftover
    // of some earlier send, which it would otherwise replay onto whatever screen opens next.
    localStorage.setItem("arbk_bridge_data", event.data.payload);
    localStorage.setItem("arbk_bridge_data_at", String(Date.now()));
    
    // Post event so that already mounted React components can capture it immediately
    window.postMessage({ type: "ARBK_BRIDGE_DATA", payload: event.data.payload }, "*");
  }
});
