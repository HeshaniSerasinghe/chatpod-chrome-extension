// background.js
// GET YOUR KEY HERE: https://aistudio.google.com/app/apikey
import { GEMINI_API_KEY } from './config.js'; //  IMPORT THE KEY

// The base URL for the Gemini Developer API (Generative Language API)
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarize") {
        (async () => {
            try {
                
                const notes = await generateNotesWithGemini(request.text);
                sendResponse({ success: true, summary: notes });
            } catch (error) {
                console.error("Error generating notes:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
});

async function generateNotesWithGemini(textToProcess) {
    const newPrompt = `i want you to extract the text and remove unnecessary keys and all and summarize the given texts in to bullet forms. you can divide them
    for sub topics for clarity. do not over summarize. keep the necessary information as it is. and finally give me the summarry in simple texts and markdown format.
    clear layout and formats. Do not add any conversational text or introductory phrases like "Here's a summary...".If you need to create a table, use standard Markdown table syntax.
`;

    const requestBody = {
        
        contents: [
            { role: "user", parts: [{ text: newPrompt + "\n\nTEXT TO PROCESS:\n" + textToProcess }] }
        ]
        
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
            'x-goog-api-key': GEMINI_API_KEY 
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`Gemini API call failed with status: ${response.status}. Error: ${errorBody.substring(0, 150)}...`);
    }

    const data = await response.json();
    
    
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
        throw new Error("Invalid response structure or content from Gemini API.");
    }
    
    return data.candidates[0].content.parts[0].text;
}