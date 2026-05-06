import Company from '../models/Company.js';

const getTenantId = (req) => req.header('x-tenant-id') || 'default-workspace';

export const getCompanyDetails = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const company = await Company.findOne({ tenantId });
        if (!company) {
            return res.json({}); // Return empty object if not set
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company details', details: error.message });
    }
};

export const updateCompanyDetails = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { 
            address, street, city, pin, phone, email, website = '', 
            gstNumber = '', merchantName = '', accountNumber = '', ifsc = '', qrCode = '' 
        } = req.body;

        if (!address?.trim() || !street?.trim() || !city?.trim() || !pin?.trim() || !phone?.trim() || !email?.trim()) {
            return res.status(400).json({ error: 'All primary fields are required' });
        }

        const updated = await Company.findOneAndUpdate(
            { tenantId },
            {
                address: address.trim(),
                street: street.trim(),
                city: city.trim(),
                pin: pin.trim(),
                phone: phone.trim(),
                email: email.trim(),
                website: website.trim(),
                gstNumber: gstNumber.trim(),
                merchantName: merchantName.trim(),
                accountNumber: accountNumber.trim(),
                ifsc: ifsc.trim(),
                qrCode: qrCode // Keep Base64 as is
            },
            { upsert: true, new: true, returnDocument: 'after' }
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update company details', details: error.message });
    }
};
