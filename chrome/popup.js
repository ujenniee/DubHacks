document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("extensionToggle");
  const languageSelect = document.getElementById("language");
  const openAIButton = document.getElementById("openAI");

  chrome.storage.sync.set({ extensionEnabled: true });
  toggle.checked = true;

  chrome.storage.sync.get(["language"], (data) => {
    const lang = data.language || "en";
    languageSelect.value = lang;
    translatePopupUI(lang);
  });

  languageSelect.addEventListener("change", async () => {
    const selectedLang = languageSelect.value;
    chrome.storage.sync.set({ language: selectedLang });
    await translatePopupUI(selectedLang);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateLanguage",
        language: selectedLang,
      });
    });
  });

  toggle.addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleExtension",
        enabled: toggle.checked,
      });
    });
  });

  openAIButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "openSidebar" });
    });
  });
});

// ==========================
// 🔤 SAFE TRANSLATION HELPERS
// ==========================
async function translateTextPopup(text, targetLang) {
  try {
    const res = await fetch("http://127.0.0.1:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: targetLang }),
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    console.warn("⚠️ Popup translation failed:", e);
    return text;
  }
}

async function translatePopupUI(lang) {
  const elements = document.querySelectorAll(".immigrant-text");

  for (const el of elements) {
    // skip elements marked "data-no-translate"
    if (el.hasAttribute("data-no-translate")) continue;
    try {
      el.textContent = await translateTextPopup(original, lang);
    } catch (err) {
      console.warn("⚠️ Skipped element:", el, err);
    }
  }
}
