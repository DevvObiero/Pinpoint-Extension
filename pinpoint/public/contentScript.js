console.log("Pinpoint widget content script loaded!");

// Create widget
const widget = document.createElement("img");
widget.src = chrome.runtime.getURL("widget.png");
widget.id = "pinpoint-widget";
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

// Hover effects
widget.addEventListener("mouseenter", () => {
  widget.style.transform = "scale(1.1)";
});
widget.addEventListener("mouseleave", () => {
  widget.style.transform = "scale(1)";
});

// Pinning mode toggle
let isPinning = false;
widget.addEventListener("click", (e) => {
  e.stopPropagation();
  isPinning = !isPinning;
  document.body.style.cursor = isPinning ? "crosshair" : "default";
  widget.style.border = isPinning ? "3px solid brown" : "none";
  console.log(
    isPinning ? "Pinning mode activated." : "Pinning mode deactivated."
  );
});

// Smart word pinning logic
document.addEventListener("click", (e) => {
  if (!isPinning || e.target === widget || widget.contains(e.target)) return;
  const range = document.caretRangeFromPoint(e.clientX, e.clientY);

  if (
    !range ||
    !range.startContainer ||
    range.startContainer.nodeType !== Node.TEXT_NODE
  )
    return;

  const textNode = range.startContainer;
  const offset = range.startOffset;

  // Split text node around the clicked word
  const textContent = textNode.textContent || "";
  const before = textContent.slice(0, offset);
  const after = textContent.slice(offset);
  const wordMatch = after.match(/^\S+/); // Match first word from offset

  if (!wordMatch) return;
  const word = wordMatch[0];

  const span = document.createElement("span");
  span.className = "pin-wrapper";
  span.style.position = "relative";
  span.textContent = word;

  // Replace the word in the text node with span
  const afterWord = after.slice(word.length);
  const parent = textNode.parentNode;
  const beforeNode = document.createTextNode(before);
  const afterNode = document.createTextNode(afterWord);

  parent?.replaceChild(afterNode, textNode);
  parent?.insertBefore(span, afterNode);
  parent?.insertBefore(beforeNode, span);

  // Create and position the pin
  const pin = document.createElement("img");
  pin.src = chrome.runtime.getURL("./widget.png");
  pin.alt = "Web Pin";
  Object.assign(pin.style, {
    position: "absolute",
    top: "-10px",
    left: "100%",
    width: "20px",
    height: "20px",
    zIndex: "10000",
    pointerEvents: "none",
    transform: "translate(0, -50%)"
  });

  span.appendChild(pin);
  console.log("Pin placed next to word:", word);

  // Change widget border to green after pin is added
  widget.style.border = "3px solid green"; // Change to green on successful pinning

  // Optionally, reset the border after a delay (e.g., 1 second)
  setTimeout(() => {
    widget.style.border = "none";
  }, 1000); // Reset border after 1 second

  // Reset pinning mode
  isPinning = false;
  document.body.style.cursor = "default";
});
