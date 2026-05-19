console.log("AIFilter content script loaded");


chrome.runtime.onMessage.addListener(

    (request, sender, sendResponse) => {

        if (request.action === "extractText") {

            const text = document.body.innerText;

            sendResponse({

                text: text
            });
        }

        return true;
    }
);