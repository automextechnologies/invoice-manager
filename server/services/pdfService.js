import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF buffer from provided data and template
 * @param {Object} data - Data to render in the template
 * @returns {Promise<Buffer>} - PDF Buffer
 */
export const generatePdf = async (data) => {
    let browser = null;
    try {
        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
        const templateHtml = await fs.readFile(templatePath, 'utf8');

        // Compile template
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // Determine if we are on Vercel or Local
        const isVercel = process.env.VERCEL || process.env.AWS_REGION;
        
        console.log(`Launching browser (Environment: ${isVercel ? 'Serverless' : 'Local'})...`);
        
        let puppeteer;
        let options;

        if (isVercel) {
            // Dynamic import for serverless-specific packages
            const chromium = (await import('@sparticuz/chromium')).default;
            puppeteer = (await import('puppeteer-core')).default;

            options = {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            };
        } else {
            // Local fallback
            puppeteer = (await import('puppeteer-core')).default;
            options = {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
                headless: true
            };
        }

        browser = await puppeteer.launch(options);

        const page = await browser.newPage();
        
        // Optimize page load
        await page.setDefaultNavigationTimeout(30000);

        // Set content with lighter wait strategy for faster generation
        console.log('Setting page content...');
        await page.setContent(finalHtml, { 
            waitUntil: 'load', // Faster than networkidle2, sufficient for most templates
            timeout: 20000 
        });

        // Generate PDF as Buffer (avoids read-only filesystem issues)
        console.log('Generating PDF buffer...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        console.log('PDF generation complete.');
        return pdfBuffer;
    } catch (error) {
        console.error('PDF Service Error:', error.message);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
        if (browser !== null) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
};

