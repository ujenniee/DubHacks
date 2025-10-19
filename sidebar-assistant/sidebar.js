// Injects the assistant sidebar if it's not already present
function injectSidebar() {
  if (document.getElementById("my-assistant-sidebar")) return;

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("sidebar.html");
  iframe.id = "my-assistant-sidebar";
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100%;
    border: none;
    z-index: 999999;
    box-shadow: -2px 0 5px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(iframe);
}

// Toggle sidebar on/off
function toggleSidebar() {
  const existing = document.getElementById("my-assistant-sidebar");
  if (existing) {
    existing.remove();
  } else {
    injectSidebar();
  }
}

// Finds search bars and adds an arrow + label next to each
function addArrowsToSearchBars() {
  const searchInputs = document.querySelectorAll(
    'input[type="search"], input[placeholder*="Search" i], input[aria-label*="Search" i]'
  );

  searchInputs.forEach(input => {
    if (input.dataset.arrowInjected) return;

    const container = document.createElement("span");
    container.className = "assistant-arrow-label";
    container.innerHTML = `➡️ <span class="label-text">Search here!</span>`;
    container.onclick = toggleSidebar;

    input.insertAdjacentElement("afterend", container);
    input.dataset.arrowInjected = "true";
  });
}

// Run once on load
addArrowsToSearchBars();

// Watch for dynamic content changes (e.g. Gmail, YouTube)
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(addArrowsToSearchBars, 300);
});
observer.observe(document.body, { childList: true, subtree: true });