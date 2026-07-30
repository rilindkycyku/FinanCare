// Which tabs count as "FinanCare". Stored as one comma-separated string (see popup.js) so the
// same setting covers a local dev server and the hosted app at once — the default matches
// localhost, 127.0.0.1 and any financare.* domain, which is what most installs need untouched.
const DEFAULT_FINANCARE_URL = "localhost,127.0.0.1,financare";

function urlPatterns(setting) {
  return String(setting || DEFAULT_FINANCARE_URL)
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SEND_TO_FINANCARE") {
    chrome.storage.sync.get({ finanCareUrl: DEFAULT_FINANCARE_URL }, (items) => {
      const patterns = urlPatterns(items.finanCareUrl);

      chrome.tabs.query({}, (tabs) => {
        const fcTabs = tabs.filter((t) => {
          const url = (t.url || "").toLowerCase();
          // chrome:// and extension pages can never be a FinanCare tab, and content scripts
          // don't run there — matching one would only produce a "sent" that goes nowhere.
          if (!url.startsWith("http")) return false;
          return patterns.some((pattern) => url.includes(pattern));
        });

        if (fcTabs.length === 0) {
          sendResponse({ success: false, reason: "no-tab", patterns });
          return;
        }

        // Delivery is what decides success: a tab can match the URL and still have no content
        // script in it (it was open before the extension was installed or reloaded, so it needs
        // a refresh). Reporting "u dërgua" in that case is exactly the silent failure to avoid.
        Promise.allSettled(
          fcTabs.map((tab) => chrome.tabs.sendMessage(tab.id, { action: "RECEIVE_ARBK", payload: request.payload }))
        ).then((results) => {
          const deliveredIndex = results.findIndex((r) => r.status === "fulfilled");
          if (deliveredIndex === -1) {
            sendResponse({ success: false, reason: "no-content-script", patterns });
            return;
          }
          const target = fcTabs[deliveredIndex];
          chrome.tabs.update(target.id, { active: true });
          chrome.windows.update(target.windowId, { focused: true });
          sendResponse({ success: true });
        });
      });
    });

    return true; // async response
  }
});
