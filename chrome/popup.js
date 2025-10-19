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
  console.log("🌐 Translating popup to:", lang);

  // Only translate labels, title, and button
  const title = document.querySelector("h2");
  const labelLang = document.querySelector('label[for="language"]');
  const labelToggle = document.querySelector(".toggle-container label");
  const askButton = document.getElementById("openAI");

  const texts = {
    title: "Immigrant Assistant",
    labelLang: "Language:",
    labelToggle: "Enable Extension",
    askButton: "Ask Assistant 💬",
  };

  try {
    const [t1, t2, t3, t4] = await Promise.all([
      translateTextPopup(texts.title, lang),
      translateTextPopup(texts.labelLang, lang),
      translateTextPopup(texts.labelToggle, lang),
      translateTextPopup(texts.askButton, lang),
    ]);

    title.textContent = `🌎 ${t1}`;
    labelLang.textContent = t2;
    labelToggle.textContent = t3;
    askButton.textContent = t4;
  } catch (e) {
    console.error("❌ Error translating popup:", e);
  }
}
