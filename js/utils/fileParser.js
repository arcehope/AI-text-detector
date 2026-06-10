/**
 * File Parser Utility
 * 
 * Extracts plain text from various file formats (.txt, .md, .pdf, .docx) client-side.
 * Integrates PDF.js for PDF parsing and Mammoth.js for Word document parsing.
 */

class FileParser {
    constructor() {
        // Initialize workers if pdfjs is loaded
        if (typeof window.pdfjsLib !== 'undefined') {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
    }

    /**
     * Read text from file
     */
    async extractText(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'txt':
            case 'md':
            case 'json':
            case 'csv':
            case 'html':
                return await this.readAsText(file);
            case 'docx':
                return await this.readAsDocx(file);
            case 'pdf':
                return await this.readAsPdf(file);
            default:
                throw new Error(`Unsupported file type: .${extension}. Please upload a .txt, .pdf, or .docx file.`);
        }
    }

    /**
     * Helper to read plain text files
     */
    readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error("Error reading text file."));
            reader.readAsText(file);
        });
    }

    /**
     * Helper to parse DOCX using Mammoth.js
     */
    readAsDocx(file) {
        return new Promise((resolve, reject) => {
            if (typeof window.mammoth === 'undefined') {
                reject(new Error("Mammoth.js library is not loaded. Cannot parse DOCX files."));
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                try {
                    const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    resolve(result.value);
                } catch (error) {
                    reject(new Error("Failed to parse Word document (.docx). File might be corrupted."));
                }
            };
            reader.onerror = () => reject(new Error("Error reading DOCX file."));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Helper to parse PDF using PDF.js
     */
    readAsPdf(file) {
        return new Promise((resolve, reject) => {
            if (typeof window.pdfjsLib === 'undefined') {
                reject(new Error("PDF.js library is not loaded. Cannot parse PDF files."));
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                try {
                    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    let fullText = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const pageText = content.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }

                    resolve(fullText);
                } catch (error) {
                    reject(new Error("Failed to parse PDF document. File might be password-protected or corrupted."));
                }
            };
            reader.onerror = () => reject(new Error("Error reading PDF file."));
            reader.readAsArrayBuffer(file);
        });
    }
}

// Export for browser global context
window.FileParser = FileParser;
