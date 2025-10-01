// background.js
// --- IMPORTANT: Replace with your actual, secure Gemini API Key ---
// GET YOUR KEY HERE: https://aistudio.google.com/app/apikey
import { GEMINI_API_KEY } from './config.js'; // ✨ IMPORT THE KEY

// The base URL for the Gemini Developer API (Generative Language API)
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarize") {
        (async () => {
            try {
                // We'll rename the function to reflect its new use with Gemini
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
    // --- The prompt can remain the same, as it's excellent and model-agnostic ---
    const newPrompt = `i want you to extract the text and remove unnecessary keys and all and summarize the given texts in to bullet forms. you can divide them
    for sub topics for clarity. do not over summarize. keep the necessary information as it is. and finally give me the summarry in simple texts and markdown format.
    clear layout and formats. Do not add any conversational text or introductory phrases like "Here's a summary...".If you need to create a table, use standard Markdown table syntax.
`;

    // --- 🔑 Key Change 1: Request Body Structure for Gemini ---
    const requestBody = {
        // Model change: Using the fast, capable Gemini 2.5 Flash model
        // You could also try "gemini-2.5-pro" for higher quality on complex text.
        // Gemini uses 'contents', which includes the role and parts (text).
        contents: [
            { role: "user", parts: [{ text: newPrompt + "\n\nTEXT TO PROCESS:\n" + textToProcess }] }
        ]
        // Note: Gemini often combines the system instruction with the user prompt
        // for optimal performance, which is done above.
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // --- 🔑 Key Change 2: API Key Header for Gemini ---
            // Gemini uses the custom 'x-goog-api-key' header for REST calls.
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
    
    // --- 🔑 Key Change 3: Response Parsing for Gemini ---
    // The response structure is different (no 'choices', content is nested).
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
        // Handle cases where the model might be blocked or return an empty candidate list
        throw new Error("Invalid response structure or content from Gemini API.");
    }
    
    return data.candidates[0].content.parts[0].text;
}