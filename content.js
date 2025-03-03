async function translateText(text, targetLang) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { type: "TRANSLATE_TEXT", text: text, targetLang: targetLang },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Message failed:", chrome.runtime.lastError);
                    resolve(text); // Return original text if message fails
                } else if (response && response.translatedText) {
                    resolve(response.translatedText);
                } else {
                    console.error("Unexpected response from background script:", response);
                    resolve(text); // Return original text if response is unexpected
                }
            }
        );
    });
}

async function translatePage() {
    let { language } = await chrome.storage.local.get("language");
    if (!language) {
        console.warn("No target language selected.");
        return;
    }

    let elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, a, div");
    for (let el of elements) {
        if (el.innerText.trim() !== "") {
            let translatedText = await translateText(el.innerText, language);
            el.innerText = translatedText;
        }
    }
}

translatePage();
