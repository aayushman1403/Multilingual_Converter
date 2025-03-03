document.getElementById("translate").addEventListener("click", async () => {
    let language = document.getElementById("language").value;
    chrome.storage.local.set({ language: language }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"]
            });
        });
    });
});
