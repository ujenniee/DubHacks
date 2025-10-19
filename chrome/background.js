chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Immigrant Assistant installed and running.");
  chrome.storage.sync.set({ extensionEnabled: true, language: "en" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Background received:", message);
  if (message.action === "ping") {
    sendResponse({ status: "pong" });
  }
  return true;
});
