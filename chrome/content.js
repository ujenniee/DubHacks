console.log("🌎 Immigrant Assistant content script loaded.");

async function translateText(text, targetLang) {
  try {
    const res = await fetch("http://127.0.0.1:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: targetLang }),
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (err) {
    console.error("❌ Translation failed:", err);
    return text;
  }
}

async function translatePageText(targetLang) {
  const textElements = document.querySelectorAll("p, h1, h2, h3, h4, span, a, button, label");
  for (const el of textElements) {
    const original = el.dataset.originalText || el.textContent.trim();
    if (!original) continue;

    el.dataset.originalText = original;
    const translated = await translateText(original, targetLang);
    el.textContent = translated;
  }
  console.log(`✅ Page translated to ${targetLang}`);
}

let activeTips = [];

async function showDemoTips(lang) {
  clearTips();
  const elements = document.querySelectorAll("input, button, a");
  const sampleText = "Click here to continue";

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const tip = document.createElement("div");
    tip.className = "immigrant-tooltip";
    tip.dataset.originalText = sampleText;
    tip.style.position = "absolute";
    tip.style.background = "#5b3df6";
    tip.style.color = "#fff";
    tip.style.padding = "4px 6px";
    tip.style.borderRadius = "6px";
    tip.style.fontSize = "12px";
    tip.style.zIndex = "9999";
    tip.style.left = `${rect.right + 10 + window.scrollX}px`;
    tip.style.top = `${rect.top + window.scrollY}px`;

    tip.textContent = await translateText(sampleText, lang);
    document.body.appendChild(tip);
    activeTips.push(tip);
  }
}

function clearTips() {
  activeTips.forEach((t) => t.remove());
  activeTips = [];
}

chrome.runtime.onMessage.addListener((message) => {
  console.log("📩 Received message from popup:", message);

  if (message.action === "toggleExtension") {
    if (message.enabled) {
      console.log("✅ Extension enabled");
      chrome.storage.sync.get("language", async (data) => {
        const lang = data.language || "en";
        await translatePageText(lang);
        await showDemoTips(lang);
      });
    } else {
      console.log("🚫 Extension disabled");
      clearTips();
    }
  }

  if (message.action === "updateLanguage") {
    console.log("🌐 Updating language to:", message.language);
    translatePageText(message.language);
  }

  if (message.action === "openSidebar") {
    toggleSidebar();
  }
});

let sidebarVisible = false;
let sidebar;

function toggleSidebar() {
  if (sidebarVisible) {
    sidebar.remove();
    sidebarVisible = false;
    return;
  }

  sidebar = document.createElement("div");
  sidebar.style.position = "fixed";
  sidebar.style.top = "0";
  sidebar.style.right = "0";
  sidebar.style.width = "320px";
  sidebar.style.height = "100vh";
  sidebar.style.background = "#fff";
  sidebar.style.borderLeft = "1px solid #ddd";
  sidebar.style.boxShadow = "-3px 0 10px rgba(0,0,0,.15)";
  sidebar.style.zIndex = "100000";
  sidebar.innerHTML = `
    <div style="padding:12px;font-family:sans-serif;">
      <b>Ask Assistant 💬</b>
      <div style="margin-top:8px; display:flex; gap:6px">
        <input id="immigrant-input" placeholder="Type a question…" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:6px"/>
        <button id="immigrant-send" style="padding:8px 12px;border:none;border-radius:6px;background:#5b3df6;color:#fff;font-weight:600;cursor:pointer">Send</button>
      </div>
      <div id="immigrant-log" style="margin-top:10px;font-size:13px;color:#333"></div>
    </div>
  `;
  document.body.appendChild(sidebar);
  sidebarVisible = true;
}
