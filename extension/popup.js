document.getElementById("scanBtn").addEventListener(

    "click",

    async () => {

        const resultDiv = document.getElementById("result");

        resultDiv.innerHTML = "Scanning...";

        try {

            const [tab] = await chrome.tabs.query({

                active: true,
                currentWindow: true
            });

            chrome.tabs.sendMessage(

                tab.id,

                { action: "extractText" },

                async (response) => {

                    try {

                        if (!response || !response.text) {

                            resultDiv.innerHTML = "No text found.";

                            return;
                        }

                        const apiResponse = await fetch(

                            "http://127.0.0.1:8000/api/detect/",

                            {

                                method: "POST",

                                headers: {

                                    "Content-Type": "application/json"
                                },

                                body: JSON.stringify({

                                    text: response.text
                                })
                            }
                        );

                        const data = await apiResponse.json();

                        let cssClass = "";

                        if (data.ai_probability <= 30) {

                            cssClass = "low";

                        } else if (data.ai_probability <= 60) {

                            cssClass = "medium";

                        } else {

                            cssClass = "high";
                        }

                        resultDiv.className = cssClass;

                        resultDiv.innerHTML = `

                            <div>${data.result}</div>

                            <div>
                                AI Probability: ${data.ai_probability}%
                            </div>
                        `;

                    } catch (err) {

                        console.error(err);

                        resultDiv.innerHTML = "Analysis failed.";
                    }
                }
            );

        } catch (error) {

            console.error(error);

            resultDiv.innerHTML = "Extension error.";
        }
    }
);