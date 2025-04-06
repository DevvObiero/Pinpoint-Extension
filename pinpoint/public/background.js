// background.js example
chrome.runtime.onInstalled.addListener(() => {
  // Background script works with chrome API
  console.log(chrome.runtime.getURL("widget.png"));
});
