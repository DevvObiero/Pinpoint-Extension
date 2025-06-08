console.log("Pinpoint Extension content script loaded!");

// Create widget
const widget = document.createElement("img");
widget.id = "pinpoint-widget";
try {
  widget.src = chrome.runtime.getURL("widget.png");
  console.log("Widget src set to widget.png");
} catch (e) {
  widget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABYSURBVDhPY2AYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBQMA1WNLv9y3zUcAAAAASUVORK5CYII=";
  console.log("Widget src set to fallback base64 due to error:", e);
}
document.body.appendChild(widget);

// Style widget
Object.assign(widget.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "48px",
  height: "48px",
  cursor: "pointer",
  zIndex: "9999",
  borderRadius: "50%",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  transition: "transform 0.2s ease-in-out"
});

// Create dropdown
const dropdown = document.createElement("div");
dropdown.id = "pinpoint-dropdown";
dropdown.style.display = "none";
document.body.appendChild(dropdown);

// Style dropdown
Object.assign(dropdown.style, {
  position: "fixed",
  bottom: "80px",
  right: "20px",
  width: "250px",
  maxHeight: "200px",
  backgroundColor: "#333",
  color: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  zIndex: "10000",
  overflowY: "auto",
  padding: "10px"
});

// Widget hover effects
widget.addEventListener("mouseenter", () => {
  widget.style.transform = "scale(1.1)";
  showRecentPins();
  console.log("Widget mouseenter");
});
widget.addEventListener("mouseleave", () => {
  widget.style.transform = "scale(1)";
  setTimeout(() => {
    if (!dropdown.matches(":hover")) {
      dropdown.style.display = "none";
    }
  }, 200);
  console.log("Widget mouseleave");
});

// Keep dropdown visible when hovered
dropdown.addEventListener("mouseenter", () => {
  dropdown.style.display = "block";
});
dropdown.addEventListener("mouseleave", () => {
  dropdown.style.display = "none";
});

// Show recent pins
function showRecentPins() {
  chrome.storage.local.get({ pins: [] }, (result) => {
    console.log("Loaded pins in dropdown:", result.pins);
    const recentPins = result.pins.slice(-5).reverse();
    dropdown.innerHTML = recentPins.length === 0
      ? "<p style='text-align: center; color: #fff;'>No highlight links yet</p>"
      : recentPins.map(pin => `
          <div style='padding: 8px; border-bottom: 1px solid #555; cursor: pointer; color: #fff;'
               onclick='window.open("${pin.url}", "_blank")'>
            <span style='font-size: 14px; display: block; font-weight: bold;'>${pin.title || "Untitled Page"}</span>
            <span style='font-size: 12px; color: #bbb;'>${pin.text.slice(0, 50)}${pin.text.length > 50 ? "..." : ""}</span>
          </div>
        `).join("");
    dropdown.style.display = "block";
  });
}

// Capture highlight links directly from copy event
document.addEventListener("copy", (e) => {
  console.log("Copy event triggered");
  const clipboardText = e.clipboardData.getData('text');
  console.log("Clipboard text from copy event:", clipboardText);
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : "";
  console.log("Selected text:", selectedText);
  if (clipboardText.includes("#:~:text=")) {
    const pageTitle = document.title || "Untitled Page";
    console.log("Highlight link detected:", clipboardText);
    console.log("Page title:", pageTitle);
    const newPin = {
      id: Date.now(),
      url: clipboardText,
      text: selectedText,
      title: pageTitle,
      platform: "webpage",
      timestamp: new Date().toISOString()
    };
    chrome.storage.local.get({ pins: [] }, (result) => {
      console.log("Current pins before save:", result.pins);
      const updatedPins = [...result.pins, newPin];
      chrome.storage.local.set({ pins: updatedPins }, () => {
        if (chrome.runtime.lastError) {
          console.error("Storage save error:", chrome.runtime.lastError);
        } else {
          console.log("Highlight link saved:", newPin);
          
          showRecentPins();
        }
      });
    });
  } else {
    console.log("No highlight link in clipboard text");
  }
});

// Initialize
window.addEventListener("load", () => {
  console.log("Page loaded");
  showRecentPins();
});

// uji 