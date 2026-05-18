document.getElementById("scanBtn")

.addEventListener(

    "click",

    async () => {

        const [tab] = await chrome.tabs.query({

            active: true,

            currentWindow: true
        });

        chrome.tabs.sendMessage(

            tab.id,

            {
                action: "getPageText"
            },

            async (response) => {

                if (!response) {

                    document.getElementById("result")
                    .innerText = "Unable to scan page";

                    return;
                }

                const pageText = response.text.substring(0, 3000);

                document.getElementById("result")
                .innerText = "Analyzing content...";

                try {

                    const apiResponse = await fetch(

                        "http://127.0.0.1:8000/api/detect/",

                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({

                                text: pageText
                            })
                        }
                    );

                    const data = await apiResponse.json();

                    document.getElementById("result")
                    .innerText =

                    `${data.result}

AI Probability: ${data.ai_probability}%`;

                }

                catch (error) {

                    document.getElementById("result")
                    .innerText = "Backend connection failed";

                    console.error(error);
                }
            }
        );
    }
);