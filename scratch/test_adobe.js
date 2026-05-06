import dotenv from 'dotenv';
import { generatePdf } from '../server/services/pdfService.js';
import fs from 'fs-extra';

dotenv.config();

const testData = {
    customerName: "Test Customer",
    address: "123 Test St",
    phone: "555-1234",
    email: "test@example.com",
    invoiceNumber: "INV-001",
    date: "2024-05-06",
    items: [
        { name: "Item 1", price: 100, qtyDisplay: 1, gstPercent: 18, total: 118 }
    ],
    subtotal: 100,
    discountPercent: 0,
    discountAmount: 0,
    grandTotal: 118,
    companyAddress: "Automex Technologies",
    companyLocation: "Dubai, UAE",
    companyWebsite: "www.automex.com",
    companyEmail: "info@automex.com",
    companyPhone: "+971 00 000 0000"
};

async function runTest() {
    try {
        console.log("Starting PDF generation test...");
        const buffer = await generatePdf(testData);
        await fs.writeFile('test-adobe.pdf', buffer);
        console.log("PDF generated successfully: test-adobe.pdf");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTest();
