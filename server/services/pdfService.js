import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF buffer from provided data and template using Adobe PDF Services
 * @param {Object} data - Data to render in the template
 * @returns {Promise<Buffer>} - PDF Buffer
 */
export const generatePdf = async (data) => {
    try {
        const clientId = process.env.ADOBE_CLIENT_ID;
        const clientSecret = process.env.ADOBE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Adobe PDF Services credentials (ADOBE_CLIENT_ID, ADOBE_CLIENT_SECRET) are missing.');
        }

        // Dynamic import to prevent startup crashes if package is missing
        const sdk = await import("@adobe/pdfservices-node-sdk");
        const {
            ServicePrincipalCredentials,
            PDFServices,
            MimeType,
            HTMLToPDFParams,
            HTMLToPDFJob,
            HTMLToPDFResult,
            PageLayout,
            SDKError,
            ServiceUsageError
        } = sdk;


        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
        const templateHtml = await fs.readFile(templatePath, 'utf8');

        // Compile template
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        console.log('Initializing Adobe PDF Services...');
        
        // 1. Initialize Credentials
        const credentials = new ServicePrincipalCredentials({
            clientId: clientId,
            clientSecret: clientSecret
        });

        // 2. Initialize PDF Services
        const pdfServices = new PDFServices({ credentials });

        // 3. Upload HTML content
        console.log('Uploading HTML to Adobe...');
        const htmlStream = Readable.from([Buffer.from(finalHtml)]);
        const inputAsset = await pdfServices.upload({
            readStream: htmlStream,
            mimeType: MimeType.HTML
        });

        // 4. Create and submit the job
        console.log('Submitting HTML to PDF job...');
        
        // Set A4 Page Layout
        const pageLayout = new PageLayout({
            pageWidth: 8.27,
            pageHeight: 11.69
        });

        const htmlToPDFParams = new HTMLToPDFParams({
            includeHeaderFooter: false,
            pageLayout: pageLayout
        });


        const job = new HTMLToPDFJob({
            inputAsset: inputAsset,
            params: htmlToPDFParams
        });

        const pollingURL = await pdfServices.submit({ job });

        // 5. Wait for the job to complete (Polling)
        console.log('Waiting for PDF generation...');
        let jobStatus;
        let pollingResult;
        
        do {
            pollingResult = await pdfServices.getJobStatus({ pollingURL });
            jobStatus = pollingResult.status;
            
            if (jobStatus === 'in progress') {
                console.log('Job still in progress, waiting...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } while (jobStatus === 'in progress');

        if (jobStatus !== 'done') {
            throw new Error(`Adobe PDF generation failed with status: ${jobStatus}`);
        }

        // 6. Get the PDF result asset
        const resultAsset = await pdfServices.getJobResult({ 
            pollingURL,
            resultType: HTMLToPDFResult
        });
        
        // 7. Get the PDF content
        console.log('Downloading PDF content...');
        const streamAsset = await pdfServices.getContent({ asset: resultAsset.result.asset });
        const pdfStream = streamAsset.readStream;
        
        // 8. Convert stream to Buffer
        const chunks = [];
        for await (const chunk of pdfStream) {
            chunks.push(chunk);
        }

        const pdfBuffer = Buffer.concat(chunks);

        console.log('PDF generation complete.');
        return pdfBuffer;

    } catch (error) {
        console.error('Adobe PDF Service Error:', error.message);
        // Check if SDK types are available for instanceof check
        try {
            const sdk = await import("@adobe/pdfservices-node-sdk");
            if (error instanceof sdk.SDKError || error instanceof sdk.ServiceUsageError) {
                throw new Error(`Adobe SDK Error: ${error.message}`);
            }
        } catch (e) {
            // Ignore error during instance check if SDK isn't loaded
        }
        throw error;
    }
};
