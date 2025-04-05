chrome.runtime.onInstalled.addListener(() => {
  console.log("Pinpoint Extension installed!");
});

// Example: Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      alert("Pinpoint Extension Activated!");
    }
  });
});
