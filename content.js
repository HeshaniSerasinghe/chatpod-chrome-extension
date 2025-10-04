// content.js

function scrapeStructuredConversation() {
    const conversation = [];
    const messageElements = document.querySelectorAll('div[data-message-author-role]');

    messageElements.forEach((element, index) => {
        const role = element.getAttribute('data-message-author-role');
        let messageHtml = ''; 

        const contentContainer = element.querySelector('.markdown, .text-base, div.relative > div > div');
        
        if (contentContainer) {
            messageHtml = contentContainer.innerHTML;
        }

        if (role && messageHtml) {
            const messageId = `chatpod-message-${index}`;
            element.id = messageId;

            conversation.push({
                id: messageId,
                role: role === 'user' ? 'User' : 'AI',
                content: messageHtml,
                textContent: contentContainer.innerText.trim()
            });
        }
    });
    return conversation;
}


function scrollToMessage(messageId) {
    const element = document.getElementById(messageId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.transition = 'background-color 0.5s ease';
        element.style.backgroundColor = 'rgba(0, 169, 143, 0.2)';
        
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
        const chatData = scrapeStructuredConversation();
        sendResponse({ content: chatData });
    } 
    else if (request.action === "scrollTo") {
        scrollToMessage(request.messageId);
    }
});