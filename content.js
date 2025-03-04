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

    // List of attributes to ignore
    const ignoredAttributes = ['style', 'class', 'id', 'src', 'href', 'data-'];
    
    // List of tags to ignore
    const ignoredTags = ['SCRIPT', 'STYLE', 'SVG', 'PATH'];

    // Function to check if node should be translated
    function shouldTranslateNode(node) {
        if (!node || !node.parentElement) return false;
        
        // Skip if parent is in ignored tags
        if (ignoredTags.includes(node.parentElement.tagName)) return false;
        
        // Skip if node is part of an attribute value
        const parentAttributes = node.parentElement.attributes;
        if (parentAttributes) {
            for (let attr of parentAttributes) {
                if (ignoredAttributes.some(ignored => attr.name.startsWith(ignored))) {
                    if (attr.value.includes(node.textContent.trim())) return false;
                }
            }
        }

        return true;
    }

    // Function to translate text nodes
    async function translateTextNode(node) {
        if (node.nodeType === Node.TEXT_NODE && 
            node.textContent.trim() !== '' && 
            shouldTranslateNode(node)) {
            let translatedText = await translateText(node.textContent.trim(), language);
            node.textContent = translatedText;
        }
    }

    // Function to walk through DOM tree
    async function walkDOM(element) {
        const treeWalker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    return shouldTranslateNode(node) ? 
                        NodeFilter.FILTER_ACCEPT : 
                        NodeFilter.FILTER_REJECT;
                }
            },
            false
        );

        let node;
        while (node = treeWalker.nextNode()) {
            await translateTextNode(node);
        }
    }

    // Start translation from body
    await walkDOM(document.body);
}
translatePage();