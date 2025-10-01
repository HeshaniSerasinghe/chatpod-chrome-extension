// popup.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Element declarations ---
    const mainView = document.getElementById('mainView');
    const selectionView = document.getElementById('selectionView');
    const startBtn = document.getElementById('startBtn');
    const backBtn = document.getElementById('backBtn');
    const selectAllCheckbox = document.getElementById('selectAll');
    const checklistDiv = document.getElementById('checklist');
    const generateBtn = document.getElementById('generateBtn');
    const selectionStatus = document.getElementById('selectionStatus');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    const resizeBtn = document.getElementById('resizeBtn');
    const downloadDocBtn = document.getElementById('downloadDocBtn');
    const downloadDocBtnText = document.getElementById('downloadDocBtnText');
    let fullConversation = [];


    // --- Function to populate the selection checklist ---
    function populateChecklist(conversation) {
        checklistDiv.innerHTML = '';
        const TRUNCATE_LIMIT = 120;
        conversation.forEach((msg, index) => {
            const item = document.createElement('div');
            item.className = 'check-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'message-checkbox';
            checkbox.dataset.index = index;
            checkbox.checked = true;

            let displayText = msg.textContent;
            if (displayText.length > TRUNCATE_LIMIT) {
                displayText = displayText.substring(0, TRUNCATE_LIMIT) + '...';
            }

            const label = document.createElement('label');
            label.innerHTML = `<span class="role">${msg.role}:</span> ${displayText}`;
            
            const goToIcon = document.createElement('span');
            goToIcon.className = 'go-to-icon';
            goToIcon.innerHTML = '➤';
            goToIcon.title = 'Scroll to this message in the chat';
            
            goToIcon.addEventListener('click', async (event) => {
                event.stopPropagation();
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                chrome.tabs.sendMessage(tab.id, { action: "scrollTo", messageId: msg.id });
            });

            item.addEventListener('click', (event) => {
                if (event.target !== goToIcon) {
                    const checkboxInside = item.querySelector('.message-checkbox');
                    checkboxInside.checked = !checkboxInside.checked;
                }
            });

            item.appendChild(checkbox);
            item.appendChild(label);
            item.appendChild(goToIcon);
            checklistDiv.appendChild(item);
        });
        selectAllCheckbox.checked = true;
    }


    // popup.js

// --- ✨ FINAL VERSION of the PDF Generation Function ✨ ---
function generateFormattedPdf(markdownText) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // --- PDF Styling and Layout Variables ---
    const MARGIN = 60;
    const FONT_SIZES = { H1: 22, H3: 16, P: 11, LI: 11 };
    const LINE_SPACING = 1.5;
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const USABLE_WIDTH = PAGE_WIDTH - (MARGIN * 2);
    let cursorY = MARGIN;

    // --- Helper function for page breaks ---
    const checkPageBreak = (neededHeight) => {
        if (cursorY + neededHeight > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            cursorY = MARGIN;
        }
    };
    
    // --- Add a title to the first page ---
    doc.setFont('helvetica', 'bold').setFontSize(FONT_SIZES.H1);
    doc.text('ChatPod Notes', PAGE_WIDTH / 2, cursorY, { align: 'center' });
    cursorY += FONT_SIZES.H1 * 2;


    // 1. Use marked.lexer to get tokens, NOT HTML
    const tokens = marked.lexer(markdownText);

    // 2. Loop through the tokens and draw the PDF manually
    tokens.forEach(token => {
        switch (token.type) {
            case 'heading':
                checkPageBreak(FONT_SIZES.H3 * 2);
                doc.setFont('helvetica', 'bold').setFontSize(FONT_SIZES.H3);
                // Clean up any markdown characters the AI might leave in the text
                const cleanHeadingText = token.text.replace(/\*/g, ''); 
                const headingText = doc.splitTextToSize(cleanHeadingText, USABLE_WIDTH);
                doc.text(headingText, MARGIN, cursorY);
                cursorY += (headingText.length * FONT_SIZES.H3 * (LINE_SPACING - 0.2)) + 10;
                break;

            case 'paragraph':
                checkPageBreak(FONT_SIZES.P * LINE_SPACING);
                doc.setFont('helvetica', 'normal').setFontSize(FONT_SIZES.P);
                // Clean up any markdown characters the AI might leave in the text
                const cleanParaText = token.text.replace(/\*/g, '');
                const paraText = doc.splitTextToSize(cleanParaText, USABLE_WIDTH);
                doc.text(paraText, MARGIN, cursorY);
                cursorY += paraText.length * FONT_SIZES.P * LINE_SPACING;
                break;

            case 'list':
                token.items.forEach(item => {
                    // ✨ THIS IS THE FIX: Skip empty list items ✨
                    if (!item.text.trim()) return;

                    const itemText = item.text.replace(/\*/g, ''); // Clean up text
                    const wrappedText = doc.splitTextToSize(itemText, USABLE_WIDTH - 20); // Indent for bullet
                    checkPageBreak(wrappedText.length * FONT_SIZES.LI * LINE_SPACING);
                    
                    doc.setFont('helvetica', 'normal').setFontSize(FONT_SIZES.LI);
                    doc.text('•', MARGIN, cursorY); // Draw bullet
                    doc.text(wrappedText, MARGIN + 20, cursorY); // Draw text
                    cursorY += (wrappedText.length * FONT_SIZES.LI * LINE_SPACING) + 5;
                });
                cursorY += 10; // Add a little space after a list
                break;

            case 'space':
                cursorY += 10; // Add space between sections
                break;
            case 'table':
                const head = [token.header.map(cell => cell.text)]; // [['Feature', 'Process', 'Thread']]
                const body = token.rows.map(row => row.map(cell => cell.text));
    
                checkPageBreak(50); // Check if there's some space for the table start

                doc.autoTable({
                    startY: cursorY,
                    head: head,
                    body: body,
                    theme: 'grid', // 'striped', 'grid', or 'plain'
                    styles: {
                        fontSize: 9,
                        cellPadding: 5,
                    },
                    headStyles: {
                        fillColor: [0, 90, 112], // A dark teal color
                        textColor: 255,
                        fontStyle: 'bold',
                    }
                });

                cursorY = doc.autoTable.previous.finalY + 20; // Move cursor below the table
                break;
        }
    });

    // --- Add page numbers to all pages ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal').setFontSize(9);
        doc.setTextColor(150);
        const pageNumText = `Page ${i} of ${pageCount}`;
        doc.text(pageNumText, PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: 'center' });
    }

    doc.save("ChatPod-Notes.pdf");
    handleSuccess("Done! Your PDF is downloading.");
}


    // --- All other functions and event listeners ---
    resizeBtn.addEventListener('click', () => { document.body.classList.toggle('expanded'); });

    downloadDocBtn.addEventListener('click', () => {
        const selectedMessages = [];
        document.querySelectorAll('.message-checkbox:checked').forEach(checkbox => {
            const index = parseInt(checkbox.dataset.index, 10);
            selectedMessages.push(fullConversation[index]);
        });
        if (selectedMessages.length === 0) {
            alert("Please select at least one message to download.");
            return;
        }
        downloadAsStyledDoc(selectedMessages, 'ChatPod-Notes.doc');
        downloadDocBtnText.textContent = 'Downloaded!';
        setTimeout(() => { downloadDocBtnText.textContent = 'Download .doc'; }, 2000);
    });

    function downloadAsStyledDoc(messages, filename) {
        const styles = `<style>body{font-family:Arial,sans-serif;line-height:1.6;margin:40px}.message-container{margin-bottom:24px;border:1px solid #ddd;padding:10px;border-radius:8px}.role{font-size:1.1em;font-weight:bold;color:#008073;margin-bottom:8px}.content{white-space:pre-wrap}p{margin:0 0 16px 0}ul,ol{padding-left:20px}li{margin-bottom:8px}code{font-family:monospace;background-color:#f0f0f0;padding:2px 4px;border-radius:4px}pre{background-color:#f0f0f0;padding:16px;border-radius:8px;overflow-x:auto}</style>`;
        let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8">${styles}</head><body>`;
        messages.forEach(msg => {
            htmlContent += `<div class="message-container"><div class="role">${msg.role}:</div><div class="content">${msg.content}</div></div>`;
        });
        htmlContent += '</body></html>';
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        startBtn.textContent = 'Reading Chat...';
        startBtn.disabled = true;
        chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
            if (chrome.runtime.lastError || !response || !response.content || response.content.length === 0) {
                alert("Could not read chat. Please refresh the page and try again.");
                startBtn.textContent = 'Start Selection';
                startBtn.disabled = false;
                return;
            }
            fullConversation = response.content;
            populateChecklist(fullConversation);
            showSelectionView();
        });
    });

    backBtn.addEventListener('click', () => { showMainView(); });

    selectAllCheckbox.addEventListener('change', (event) => {
        document.querySelectorAll('.message-checkbox').forEach(cb => cb.checked = event.target.checked);
    });

    generateBtn.addEventListener('click', () => {
        const selectedMessages = [];
        document.querySelectorAll('.message-checkbox:checked').forEach(checkbox => {
            const index = parseInt(checkbox.dataset.index, 10);
            const message = fullConversation[index];
            selectedMessages.push(`${message.role}:\n${message.textContent}`);
        });

        if (selectedMessages.length === 0) {
            alert("Please select at least one message to include in the PDF.");
            return;
        }

        const selectedText = selectedMessages.join('\n\n');
        selectionStatus.textContent = "Generating notes with AI...";
        spinner.style.display = 'block';
        btnText.textContent = 'Working...';
        generateBtn.disabled = true;
        downloadDocBtn.disabled = true;

        chrome.runtime.sendMessage({ action: "summarize", text: selectedText }, (summaryResponse) => {
            if (chrome.runtime.lastError || !summaryResponse.success) {
                handleError("AI generation failed. Please try again.");
                console.error(summaryResponse ? summaryResponse.error : "Unknown error");
                return;
            }
            selectionStatus.textContent = "Formatting and creating PDF...";
            generateFormattedPdf(summaryResponse.summary);
        });
    });

    function showMainView() {
        selectionView.style.display = 'none';
        mainView.style.display = 'block';
        startBtn.textContent = 'Start Selection';
        startBtn.disabled = false;
        document.body.classList.remove('expanded');
    }

    function showSelectionView() {
        mainView.style.display = 'none';
        selectionView.style.display = 'block';
        handleSuccess("");
    }

    function handleError(message) {
        selectionStatus.textContent = message;
        spinner.style.display = 'none';
        btnText.textContent = 'Create PDF';
        generateBtn.disabled = false;
        downloadDocBtn.disabled = false;
    }

    function handleSuccess(message) {
        selectionStatus.textContent = message;
        spinner.style.display = 'none';
        btnText.textContent = 'Create PDF';
        generateBtn.disabled = false;
        downloadDocBtn.disabled = false;
    }

    
});