console.log("Pinpoint widget content script loaded!");

// Create widget
const widget = document.createElement("img");
widget.src = chrome.runtime.getURL("widget.png");
widget.id = "pinpoint-widget";
document.body.appendChild(widget);

// Create dropdown for recent pins
const dropdown = document.createElement("div");
dropdown.id = "pinpoint-dropdown";
dropdown.style.display = "none";
document.body.appendChild(dropdown);

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
//  dropdown
Object.assign(dropdown.style, {
  position: "fixed",
  bottom: "80px",
  right: "20px",
  width: "200px",
  maxHeight: "150px",
  backgroundColor: "#333", // Darker background for contrast
  color: "#fff", // White text for readability
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  zIndex: "10000",
  overflowY: "auto",
  padding: "10px",
  display: "none"
});

// Hover effects for widget
widget.addEventListener("mouseenter", () => {
  widget.style.transform = "scale(1.1)";
  showRecentPins();
});
widget.addEventListener("mouseleave", () => {
  widget.style.transform = "scale(1)";
  setTimeout(() => {
    if (!dropdown.matches(":hover")) {
      dropdown.style.display = "none";
    }
  }, 200);
});

// Keep dropdown visible when hovered
dropdown.addEventListener("mouseenter", () => {
  dropdown.style.display = "block";
});
dropdown.addEventListener("mouseleave", () => {
  dropdown.style.display = "none";
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

// Load and display recent pins
function showRecentPins() {
  chrome.storage.local.get({ pins: [] }, (result) => {
    const recentPins = result.pins.slice(-3).reverse();
    dropdown.innerHTML =
      recentPins.length === 0
        ? "<p style='text-align: center; color: #fff;'>No pins yet</p>"
        : recentPins
            .map(
              (pin) => `
          <div style='padding: 8px; border-bottom: 1px solid #555; cursor: pointer; color: #fff;'
               onclick='window.open("${pin.url}?pinId=${pin.id}", "_blank")'>
            <span style='font-size: 14px;'>${pin.word}</span>
          </div>
        `
            )
            .join("");
    dropdown.style.display = "block";
  });
}

function scrollWhenContentReady(selectorToWaitFor, callback) {
  const targetExists = () => document.querySelector(selectorToWaitFor);

  if (targetExists()) {
    callback();
    return;
  }

  const observer = new MutationObserver(() => {
    if (targetExists()) {
      setTimeout(() => {
        callback();
        observer.disconnect();
      }, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function scrollToPinIfAvailable() {
  const urlParams = new URLSearchParams(window.location.search);
  const pinId = urlParams.get("pinId");
  if (!pinId) return;

  chrome.storage.local.get({ pins: [] }, (result) => {
    const pin = result.pins.find((p) => p.id.toString() === pinId);
    if (!pin || !window.location.href.includes(pin.url)) return;

    const scroll = () => {
      window.scrollTo({
        top: pin.scrollY,
        behavior: "smooth"
      });
      console.log("🔍 Scrolled to pinned location:", pin);
    };

    scrollWhenContentReady(".real-content", scroll);
  });
}

window.addEventListener("load", () => {
  setTimeout(scrollToPinIfAvailable, 500);
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
  const textContent = textNode.textContent || "";
  const before = textContent.slice(0, offset);
  const after = textContent.slice(offset);
  const wordMatch = after.match(/^\S+/);
  if (!wordMatch) return;
  const word = wordMatch[0];

  const parent = textNode.parentNode;
  if (!parent) return;
  const beforeNode = document.createTextNode(before);
  const wordNode = document.createTextNode(word);
  const afterNode = document.createTextNode(after.slice(word.length));

  const span = document.createElement("span");
  span.className = "pin-wrapper";
  span.style.position = "relative";
  span.style.display = "inline";
  span.appendChild(wordNode);

  parent.replaceChild(afterNode, textNode);
  parent.insertBefore(span, afterNode);
  parent.insertBefore(beforeNode, span);

  const pinImg = document.createElement("img");
  pinImg.src = chrome.runtime.getURL("widget.png");
  pinImg.alt = "Web Pin";
  Object.assign(pinImg.style, {
    position: "absolute",
    top: "-10px",
    left: "100%",
    width: "20px",
    height: "20px",
    zIndex: "10000",
    pointerEvents: "none",
    transform: "translate(0, -50%)"
  });
  span.appendChild(pinImg);
  console.log("Pin placed next to word:", word);

  const rect = span.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const absoluteLeft = rect.left + window.scrollX;

  const newPin = {
    id: Date.now(),
    url: window.location.href,
    word: word,
    scrollY: window.scrollY,
    pinTop: absoluteTop,
    pinLeft: absoluteLeft
  };

  chrome.storage.local.get({ pins: [] }, (result) => {
    const updatedPins = [...result.pins, newPin];
    chrome.storage.local.set({ pins: updatedPins }, () => {
      console.log("Pin saved:", newPin);
    });
  });

  widget.style.border = "3px solid green";
  setTimeout(() => {
    widget.style.border = "none";
  }, 1000);

  isPinning = false;
  document.body.style.cursor = "default";
});

// Highlight pin on page load
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pinId = urlParams.get("pinId");
  if (pinId) {
    chrome.storage.local.get({ pins: [] }, (result) => {
      const pin = result.pins.find((p) => p.id.toString() === pinId);
      if (pin) {
        const marker = document.createElement("div");
        marker.style.position = "absolute";
        marker.style.top = `${pin.pinTop - 10}px`;
        marker.style.left = `${pin.pinLeft - 10}px`;
        marker.style.width = "120px";
        marker.style.height = "40px";
        marker.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
        marker.style.border = "2px solid orange";
        marker.style.zIndex = "100000";
        marker.style.pointerEvents = "none";
        marker.style.display = "flex";
        marker.style.alignItems = "center";
        marker.style.justifyContent = "center";
        marker.textContent = "Pinned Here!";
        document.body.appendChild(marker);

        const scrollContainer = document.querySelector("main .overflow-y-auto");
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: pin.scrollY, behavior: "smooth" });
          console.log("Scrolled ChatGPT container.");
        } else {
          window.scrollTo({ top: pin.scrollY, behavior: "smooth" });
          console.log("Fallback to window scroll.");
        }

        setTimeout(() => {
          marker.remove();
        }, 1300);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    });
  }
});
