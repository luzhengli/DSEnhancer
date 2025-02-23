// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mermaid Renderer extension installed');
});

// No need for chrome.action.onClicked listener since we're using popup 