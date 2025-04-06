// Create widget element

/// <reference types="chrome" />

console.log("Pinpoint widget content script loaded!");

// contentScript.js
const widget = document.createElement("img");
widget.src = chrome.runtime.getURL("widget.png"); // Use the correct path to the image
widget.id = "pinpoint-widget";
document.body.appendChild(widget);

// Style the widget
widget.style.position = "fixed";
widget.style.bottom = "20px";
widget.style.right = "20px";
widget.style.width = "48px";
widget.style.height = "48px";
widget.style.cursor = "pointer";
widget.style.zIndex = "9999";
widget.style.borderRadius = "50%";
widget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
widget.style.transition = "transform 0.2s ease-in-out";
// widget.style.backgroundColor = "white";

// Hover effect
widget.addEventListener("mouseenter", () => {
  widget.style.transform = "scale(1.1)";
});
widget.addEventListener("mouseleave", () => {
  widget.style.transform = "scale(1)";
});

// Click event (for now just log)
widget.addEventListener("click", () => {
  console.log("Widget clicked - ready to pin!");
  // Here you could open a modal, store current URL, etc.
});

// Append to body
document.body.appendChild(widget);

// settings

// === SETTINGS PANEL === //
const settingsPanel = document.createElement("div");
settingsPanel.id = "pinpoint-settings";
settingsPanel.style.position = "fixed";
settingsPanel.style.bottom = "80px"; // above widget
settingsPanel.style.right = "20px";
settingsPanel.style.width = "220px";
settingsPanel.style.padding = "12px";
settingsPanel.style.backgroundColor = "#fff";
settingsPanel.style.borderRadius = "10px";
settingsPanel.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
settingsPanel.style.zIndex = "9999";
settingsPanel.style.display = "none"; // hidden by default
settingsPanel.style.fontFamily = "sans-serif";
settingsPanel.innerHTML = `
  <strong style="font-size: 14px;">Settings</strong>
  <hr style="margin: 8px 0;" />
  <label style="display:block; margin-bottom: 8px;">
    <input type="checkbox" id="toggle-widget" checked />
    Show Widget
  </label>
  <label style="display:block; margin-bottom: 8px;">
    <input type="range" id="opacity-range" min="0.2" max="1" step="0.1" value="1" />
    Opacity
  </label>
  <button id="close-settings" style="margin-top: 10px; background:#eee; border:none; padding:6px 10px; border-radius:5px; cursor:pointer;">Close</button>
`;
document.body.appendChild(settingsPanel);

widget.addEventListener("click", () => {
  // Toggle settings panel
  if (settingsPanel.style.display === "none") {
    settingsPanel.style.display = "block";
  } else {
    settingsPanel.style.display = "none";
  }
});

const toggleWidget = document.getElementById("toggle-widget");
const opacityRange = document.getElementById("opacity-range");
const closeSettings = document.getElementById("close-settings");

// Show/hide widget
toggleWidget.addEventListener("change", (e) => {
  widget.style.display = e.target.checked ? "block" : "none";
});

// Adjust opacity
opacityRange.addEventListener("input", (e) => {
  widget.style.opacity = e.target.value;
});

// Close settings panel
closeSettings.addEventListener("click", () => {
  settingsPanel.style.display = "none";
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_SETTINGS") {
    settingsPanel.style.display =
      settingsPanel.style.display === "none" ? "block" : "none";
  }
});
