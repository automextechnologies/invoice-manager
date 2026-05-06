const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

const generatePdf = async (data) => {
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
        
        // Increase timeout for slow resource loading (like fonts)
        await page.setDefaultNavigationTimeout(60000);

        // Set content
        console.log('Setting page content...');
        // networkidle2 is more resilient than networkidle0 for external fonts
        await page.setContent(finalHtml, { waitUntil: 'networkidle2', timeout: 60000 });

        // Generate PDF - use a safe timestamp-based ID for the physical file
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const pdfPath = path.join(__dirname, `../temp/${tempId}.pdf`);

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

module.exports = { generatePdf };
