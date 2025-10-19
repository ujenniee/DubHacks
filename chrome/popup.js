document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("extensionToggle");
  const languageSelect = document.getElementById("language");
  const openAIButton = document.getElementById("openAI");

  // Load saved language and toggle state
  chrome.storage.sync.get(["language", "extensionEnabled"], (data) => {
    if (data.language) languageSelect.value = data.language;
    if (data.extensionEnabled !== undefined)
      toggle.checked = data.extensionEnabled;

    // When loading, immediately translate popup UI into saved language
    translatePopupUI(languageSelect.value);
  });

  // When user changes language
  languageSelect.addEventListener("change", async () => {
    const selectedLang = languageSelect.value;
    chrome.storage.sync.set({ language: selectedLang });

    // Translate popup text live
    await translatePopupUI(selectedLang);

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateLanguage",
        language: selectedLang,
      });
    });
  });

  // Toggle extension on/off
  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ extensionEnabled: enabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleExtension",
        enabled,
      });
    });
  });

  // Ask Assistant button
  openAIButton?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "openSidebar" });
    });
  });
});

// ============================
// 🔤 TRANSLATION HELPERS
// ============================

// Calls FastAPI backend
async function translateTextPopup(text, targetLang) {
  try {
    const res = await fetch("http://localhost:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: targetLang }),
    });

    const data = await res.json();
    console.log("Backend response:", data);
    return data.translatedText || text;
  } catch (e) {
    console.warn("Popup translation failed:", e);
    return text;
  }
}

// Loops through all UI elements and translates them
async function translatePopupUI(lang) {
  const elements = document.querySelectorAll(".immigrant-text");
  for (const el of elements) {
    const original = el.dataset.originalText || el.textContent;
    el.dataset.originalText = original;
    el.textContent = await translateTextPopup(original, lang);
  }
}

