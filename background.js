const API_KEY = "AIzaSyBks2CPbqnw_Eg1kbCP94xPqTtn0dojaMg"; // Replace with your actual API key

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed and Ready");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TRANSLATE_TEXT") {
        let url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        
        let requestBody = {
            q: message.text,
            target: message.targetLang,
            format: "text"
        };

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.translations) {
                sendResponse({ translatedText: data.data.translations[0].translatedText });
            } else {
                console.error("Invalid response from API", data);
                sendResponse({ translatedText: message.text });
            }
        })
        .catch(error => {
            console.error("Translation API error:", error);
            sendResponse({ translatedText: message.text }); // Return original text on error
        });

        return true; // Ensures async response works
    }
});
