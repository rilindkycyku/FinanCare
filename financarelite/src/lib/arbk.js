/** Parses the exact ARBK bridge payload shape the FinanCare-ARBK-Extension sends. */
export function parseArbkPayload(payloadStr) {
  const parsed = JSON.parse(payloadStr);
  const list = parsed?.tableSearch?.tableList || [];
  return list
    .filter((item) => item.teDhenatBiznesit && item.teDhenatBiznesit.StatusiARBK === "Regjistruar")
    .map((item) => item.teDhenatBiznesit);
}

// Bridge contract with FinanCare-ARBK-Extension: it writes the payload to localStorage and then
// posts it, so the data survives the gap between the tab being focused and the right screen being
// mounted. Both consumers (the client dialog and the business-details page) go through here, so
// they agree on when a payload is spent and when it's too old to still be meant for them.
const BRIDGE_KEY = "arbk_bridge_data";
const BRIDGE_AT_KEY = "arbk_bridge_data_at";

// A stored payload is a hand-off meant to be picked up seconds later. Past this it's almost
// certainly a leftover from an earlier send, and replaying it — onto the business's own details,
// say — would be worse than ignoring it.
const MAX_PAYLOAD_AGE_MS = 5 * 60 * 1000;

export function clearPendingArbkPayload() {
  try {
    localStorage.removeItem(BRIDGE_KEY);
    localStorage.removeItem(BRIDGE_AT_KEY);
  } catch {
    /* nothing to clear if storage is blocked */
  }
}

/** Reads (and clears) a payload the extension left behind before focusing this tab. Returns null
 * when there's nothing pending, or when what's there has gone stale. */
export function takePendingArbkPayload() {
  try {
    const payload = localStorage.getItem(BRIDGE_KEY);
    const at = parseInt(localStorage.getItem(BRIDGE_AT_KEY) || "0", 10);
    clearPendingArbkPayload();
    if (!payload) return null;
    // No timestamp means an older extension build wrote it — take that at face value.
    if (at && Date.now() - at > MAX_PAYLOAD_AGE_MS) return null;
    return payload;
  } catch {
    return null; // storage blocked — the live postMessage path still works
  }
}

/** Subscribes to payloads arriving while this tab is already open, and delivers any that was
 * left in storage before it got here. Returns the unsubscribe function. */
export function subscribeArbkBridge(onPayload) {
  const handleMessage = (event) => {
    if (event.data && event.data.type === "ARBK_BRIDGE_DATA" && event.data.payload) {
      // The same payload also sits in storage as the hand-off copy; it's been consumed here, so
      // clear it rather than leave it to be replayed on whichever screen mounts next.
      clearPendingArbkPayload();
      onPayload(event.data.payload);
    }
  };
  window.addEventListener("message", handleMessage);

  const pending = takePendingArbkPayload();
  if (pending) onPayload(pending);

  return () => window.removeEventListener("message", handleMessage);
}
