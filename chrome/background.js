//sends information fron the popup and passes it through the front page
console.log("Immigrant Assistant background script running.");

// Keeps track of whether the extension is enabled
let extensionEnabled = true;

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleExtension") {
    extensionEnabled = message.enabled;
    console.log(extensionEnabled ? "✅ Extension ON" : "🚫 Extension OFF");
  }

  if (message.action === "openSidebar") {
    // Relay the sidebar command to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "openSidebar" });
    });
  }

  if (message.action === "updateLanguage") {
    // Relay language update to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateLanguage",
        language: message.language
      });
    });
  }
});

  