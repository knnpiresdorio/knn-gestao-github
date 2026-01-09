import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates and downloads a multi-page PDF from specified HTML elements.
 * @param elementIds Array of IDs of the HTML elements to capture.
 * @param filename The name of the file to save.
 */
export const exportToPdf = async (elementIds: string[], filename: string = 'dashboard-report.pdf') => {
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4' // [841.89, 595.28] in points
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < elementIds.length; i++) {
        const element = document.getElementById(elementIds[i]);
        if (!element) {
            console.error(`Element with id "${elementIds[i]}" not found.`);
            continue;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // Force dark mode context for the capture
                    clonedDoc.documentElement.classList.add('dark');
                    const clonedElement = clonedDoc.getElementById(elementIds[i]);
                    if (clonedElement) {
                        clonedElement.style.height = 'auto';
                        clonedElement.style.overflow = 'visible';
                        clonedElement.style.padding = '40px';
                        clonedElement.style.backgroundColor = '#0f172a'; // Ensure a dark container background
                        clonedElement.style.borderRadius = '20px';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate dimensions to fit landscape A4
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;

            // Center horizontally and vertically
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            if (i > 0) {
                pdf.addPage('a4', 'landscape');
            }

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        } catch (error) {
            console.error(`Error generating PDF for section ${elementIds[i]}:`, error);
        }
    }

    pdf.save(filename);
};
