console.log("Immigrant Assistant content script loaded.");

// ---- translation helper (calls your FastAPI backend) ----
async function translateText(text, targetLang) {
  try {
    const res = await fetch("http://127.0.0.1:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: targetLang })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    console.warn("Translation failed:", e);
    return text;
  }
}

// ---- tooltip management ----
let activeTips = [];

async function showDemoTips(lang) {
  clearTips();
  const elements = document.querySelectorAll("input, button, a");
  const original = "Click here to continue";

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue; // skip hidden

    const tip = document.createElement("div");
    tip.className = "immigrant-tooltip";
    tip.dataset.originalText = original;
    tip.style.position = "absolute";
    tip.style.background = "#5b3df6";
    tip.style.color = "#fff";
    tip.style.padding = "4px 6px";
    tip.style.borderRadius = "6px";
    tip.style.fontSize = "12px";
    tip.style.zIndex = "9999";
    tip.style.left = `${rect.right + 10 + window.scrollX}px`;
    tip.style.top  = `${rect.top + window.scrollY}px`;

    // translate tooltip text based on selected language
    tip.textContent = await translateText(original, lang);

    document.body.appendChild(tip);
    activeTips.push(tip);
  }
}

function clearTips() {
  activeTips.forEach(t => t.remove());
  activeTips = [];
}

// ---- dynamically update all tooltips ----
async function updateAllTooltips(lang) {
  const tips = document.querySelectorAll(".immigrant-tooltip");
  for (const tip of tips) {
    const original = tip.dataset.originalText || tip.textContent;
    tip.textContent = await translateText(original, lang);
  }
}

// ---- NEW: translate any elements inside the extension popup ----
async function translateUI(lang) {
  const elements = document.querySelectorAll(".immigrant-text");
  for (const el of elements) {
    const original = el.dataset.originalText || el.textContent;
    el.dataset.originalText = original;
    el.textContent = await translateText(original, lang);
  }
}

// ---- handle messages from popup.js ----
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateLanguage") {
    console.log("🌐 Updating language to:", message.language);
    translateWholePage(message.language);
  }
});

// ---- main translation logic ----
async function translateWholePage(targetLang) {
  const elements = Array.from(
    document.querySelectorAll("p, h1, h2, h3, span, a, button, li")
  );

  console.log(`🈶 Found ${elements.length} text elements to translate`);

  for (const el of elements) {
    const original = el.innerText.trim();
    if (!original || original.length < 2) continue;

    try {
      const res = await fetch("http://127.0.0.1:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original, target_language: targetLang }),
      });
      const data = await res.json();

      if (data.translatedText) {
        el.innerText = data.translatedText;
      }
    } catch (e) {
      console.warn("⚠️ Translation failed:", e);
    }
  }

  console.log("✅ Page translation completed!");
}



// ---- minimal sidebar ----
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
    <div style="padding:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif">
      <b class="immigrant-text">Ask Assistant</b>
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
async function translateText(text, selectedLang) {
  try {
    console.log("Sending request to backend:", text, "→", selectedLang);

    const response = await fetch("http://localhost:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: selectedLang }),
    });

    const data = await response.json();
    console.log("Backend response:", data);

    return data.translatedText || text;
  } catch (err) {
    console.error("Translation error:", err);
    return text; // fallback
  }
}