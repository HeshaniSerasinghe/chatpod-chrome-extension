# chatpod-chrome-extension

# A Chrome extension that organizes AI chat logs, lets you select key insights, and export them to Word or AI-powered PDF summaries.

ChatPod – Chrome Extension for Smarter AI Conversations

✨ Tired of scrolling through endless AI chat logs to find the one thing that mattered?
ChatPod is a Chrome Extension that helps you organize, extract, and summarize your conversations with tools like ChatGPT and Gemini.

🌟 Features

Clean Navigation – View your entire conversation in a structured checklist.

Selective Export – Pick only the key questions & answers, ignore the noise.

Instant Export – Save your selections into a formatted Word document.

AI Summarization – Generate a concise PDF summary powered by the Gemini API.

Productivity Boost – Save hours of scrolling, reviewing, and copy-pasting.

🛠️ Tech Stack

JavaScript – Core logic & UI

Chrome Extension API – Popup, background, and content scripts

Gemini API – For AI-powered summarization

jsPDF – PDF generation

FileSaver.js – Word/Doc export

📂 Project Structure
ChatPod/
│── manifest.json # Chrome extension config  
│── background.js # Handles extension lifecycle & messaging  
│── content.js # Scrapes chat content from DOM  
│── popup.html # Extension popup UI  
│── popup.js # Popup logic (export, summarization, etc.)  
│── styles.css # Basic styling  
│── icons/ # Extension icons  
│── README.md # Project documentation (this file)

🚀 Installation

Clone the repo

git clone https://github.com/HeshaniSerasinghe/chatpod-chrome-extension.git
cd chatpod

Open Chrome → go to chrome://extensions/

Enable Developer Mode (top-right toggle)

Click Load Unpacked → Select the project folder

The extension will appear in your Chrome toolbar 🎉

⚡ Usage

Open a conversation in ChatGPT or Gemini

Click the ChatPod extension icon

Select the messages you want to keep

Export → choose between Word or AI-Powered PDF Summary

🔮 Future Improvements

Add support for more AI platforms (Claude, Perplexity, etc.)

Custom export themes (dark mode, academic style, etc.)

Direct Google Docs / Notion export

👩‍💻 Author

Built with ❤️ by Heshani Serasinghe

🌐 LinkedIn: "https://www.linkedin.com/in/heshani-serasinghe/"

📫 Reach me at: serasingheheshani@gmail.com

📜 License

MIT License – feel free to use, modify, and share!
