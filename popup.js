document.getElementById("translate").addEventListener("click", async () => {
    let language = document.getElementById("language").value;

    chrome.storage.local.set({ language: language }, () => {
        console.log(`Language set to: ${language}`);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    chrome.storage.local.get("language", async ({ language }) => {
                        console.log(`Translating page to: ${language}`);
                        translatePage();
                    });
                }
            });
        });
    });
});
