
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPin") {
    console.log("Received openPin request:", request.url);
    chrome.tabs.create({ url: request.url });
  }
});