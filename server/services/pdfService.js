import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdf = async (data) => {
    try {
        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
        const templateHtml = await fs.readFile(templatePath, 'utf8');

        // Compile template
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // Launch puppeteer
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });

        const page = await browser.newPage();
        
        // Increase timeout for slow resource loading
        await page.setDefaultNavigationTimeout(60000);

        // Set content
        console.log('Setting page content...');
        await page.setContent(finalHtml, { waitUntil: 'networkidle2', timeout: 60000 });

        // Generate PDF
        const tempDir = path.join(__dirname, '../temp');
        await fs.ensureDir(tempDir);
        
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const pdfPath = path.join(tempDir, `${tempId}.pdf`);

        console.log(`Generating PDF at: ${pdfPath}`);
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        await browser.close();
        console.log('PDF generation complete.');
        return pdfPath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
