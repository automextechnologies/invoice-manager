const path = require('path');
const fs = require('fs-extra');
const { generatePdf } = require('../services/pdfService');
const Company = require('../models/Company');
const Invoice = require('../models/Invoice');

const getNextInvoiceNumber = async (req, res) => {
    try {
        const tenantId = req.header('x-tenant-id') || 'default-workspace';
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        
        // Find invoices created today for this tenant
        const count = await Invoice.countDocuments({
            tenantId,
            invoiceNumber: { $regex: new RegExp(`^${today}-`) }
        });

        const nextNumber = count + 1;
        const invoiceNumber = `${today}-${nextNumber}`;

        res.json({ invoiceNumber });
    } catch (error) {
        console.error('Error fetching next invoice number:', error);
        res.status(500).json({ error: 'Failed to fetch invoice number' });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const tenantId = req.header('x-tenant-id') || 'default-workspace';
        const invoices = await Invoice.find({ tenantId }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

const generateInvoice = async (req, res) => {
    let pdfPath = '';
    try {
        const invoiceData = req.body;
        const tenantId = req.header('x-tenant-id') || 'default-workspace';

        // Fetch company details from DB to use as defaults
        const company = await Company.findOne({ tenantId });
        const companyDefaults = company || {};

        // Validation (basic)
        if (!invoiceData.invoiceNumber || !invoiceData.customerName || !invoiceData.items) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Add calculations to data if not provided (safety)
        const normalizedItems = invoiceData.items.map((item) => {
            const inputQty = Number(item.qty || 0);
            const qty = inputQty > 0 ? inputQty : 1;
            const price = Number(item.price || 0);
            const itemSubtotal = qty * price;
            const gstPercent = Number(item.gstPercent || 0);
            const gstAmount = (itemSubtotal * gstPercent) / 100;
            const total = itemSubtotal + gstAmount;

            return {
                ...item,
                qty: inputQty,
                qtyDisplay: inputQty > 0 ? inputQty : '-',
                price: price.toFixed(2),
                gstPercent: gstPercent.toFixed(2),
                gstAmount: gstAmount.toFixed(2),
                itemSubtotal: itemSubtotal.toFixed(2),
                total: total.toFixed(2)
            };
        });

        const subtotal = normalizedItems.reduce((sum, item) => sum + Number(item.itemSubtotal), 0);
        const totalGst = normalizedItems.reduce((sum, item) => sum + Number(item.gstAmount), 0);
        const discountPercent = Number(invoiceData.discountPercent || 0);
        const discountAmount = (subtotal * discountPercent) / 100;
        const grandTotal = subtotal + totalGst - discountAmount;

        // Handle Logo (Base64 encoding for Puppeteer)
        let logoBase64 = '';
        try {
            const logoPath = path.join(__dirname, '../../resource/automexlogoblack2 (2).png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = await fs.readFile(logoPath);
                const logoExt = path.extname(logoPath).substring(1);
                logoBase64 = `data:image/${logoExt};base64,${logoBuffer.toString('base64')}`;
            }
        } catch (err) {
            console.warn('Logo processing failed:', err.message);
        }

        const dataToRender = {
            ...invoiceData,
            items: normalizedItems,
            subtotal: subtotal.toFixed(2),
            totalGst: totalGst.toFixed(2),
            discountPercent: discountPercent.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            companyAddress: invoiceData.companyAddress || companyDefaults.address || '-',
            companyLocation: [
                invoiceData.companyStreet || companyDefaults.street,
                invoiceData.companyCity || companyDefaults.city,
                invoiceData.companyPin || companyDefaults.pin
            ].filter(Boolean).join(', ') || '-',
            companyWebsite: invoiceData.companyWebsite || companyDefaults.website || '-',
            companyEmail: invoiceData.companyEmail || companyDefaults.email || '-',
            companyPhone: invoiceData.companyPhone || companyDefaults.phone || '-',
            companyGst: invoiceData.companyGst || companyDefaults.gstNumber || '',
            companyMerchant: invoiceData.companyMerchant || companyDefaults.merchantName || '',
            companyAccount: invoiceData.companyAccount || companyDefaults.accountNumber || '',
            companyIfsc: invoiceData.companyIfsc || companyDefaults.ifsc || '',
            qrCode: invoiceData.qrCode || companyDefaults.qrCode || null,
            logoUrl: logoBase64 || 'https://via.placeholder.com/150'
        };


        // 1. Generate PDF
        pdfPath = await generatePdf(dataToRender);

        // 2. Prepare filename
        let fileName = '';
        if (invoiceData.customFileName) {
            fileName = invoiceData.customFileName.endsWith('.pdf') ? invoiceData.customFileName : `${invoiceData.customFileName}.pdf`;
        } else {
            fileName = `${invoiceData.invoiceNumber}-${invoiceData.customerName.replace(/\s+/g, '_')}.pdf`;
        }



        // 4. Save Invoice to Database
        try {
            await Invoice.findOneAndUpdate(
                { invoiceNumber: dataToRender.invoiceNumber, tenantId },
                {
                    tenantId,
                    invoiceNumber: dataToRender.invoiceNumber,
                    customerName: dataToRender.customerName,
                    phone: dataToRender.phone,
                    address: dataToRender.address,
                    email: dataToRender.email,
                    date: dataToRender.date,
                    items: dataToRender.items.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        price: Number(item.price),
                        gstPercent: Number(item.gstPercent),
                        total: Number(item.total)
                    })),
                    subtotal: Number(dataToRender.subtotal),
                    discountPercent: Number(dataToRender.discountPercent),
                    discountAmount: Number(dataToRender.discountAmount),
                    totalGst: Number(dataToRender.totalGst),
                    grandTotal: Number(dataToRender.grandTotal),
                    status: 'generated'
                },
                { upsert: true, new: true }
            );
            console.log(`Invoice ${dataToRender.invoiceNumber} saved/updated in DB.`);
        } catch (dbError) {
            console.error('Failed to save invoice to DB:', dbError.message);
            // We continue even if DB save fails, so the user still gets their PDF
        }

        // 5. Send PDF back as response
        const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);



        console.log(`Sending PDF: ${safeFileName}`);
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);

        // 6. Delete temp file after streaming finishes
        fileStream.on('end', async () => {
            try {
                await fs.remove(pdfPath);
            } catch (err) {
                console.error('Error deleting temp file:', err);
            }
        });

    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ error: 'Failed to generate invoice', details: error.message });

        // Cleanup on error
        if (pdfPath && fs.existsSync(pdfPath)) {
            await fs.remove(pdfPath);
        }
    }
};

module.exports = { generateInvoice, getNextInvoiceNumber, getAllInvoices };
