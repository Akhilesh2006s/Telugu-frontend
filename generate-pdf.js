import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDF() {
    try {
        console.log('Starting PDF generation...');
        
        // Launch browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Load the HTML file
        const htmlPath = join(__dirname, 'cloud-hosting-costs.html');
        await page.goto(`file://${htmlPath}`, {
            waitUntil: 'networkidle0'
        });
        
        // Set viewport for better rendering
        await page.setViewport({
            width: 1200,
            height: 800
        });
        
        // Generate PDF
        const pdfPath = join(__dirname, 'Telugu-Bhasha-Gyan-Cloud-Hosting-Costs.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        console.log(`PDF generated successfully: ${pdfPath}`);
        
        await browser.close();
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

generatePDF();


