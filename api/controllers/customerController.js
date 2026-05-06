const Customer = require('../models/Customer');

const getTenantId = (req) => req.header('x-tenant-id') || 'default-workspace';

const listCustomers = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const customers = await Customer.find({ tenantId }).sort({ updatedAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    }
};

const createCustomer = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { customerName, email, phone, address } = req.body;

        if (!customerName?.trim() || !email?.trim() || !phone?.trim() || !address?.trim()) {
            return res.status(400).json({ error: 'All fields (name, email, phone, address) are required' });
        }

        const customer = await Customer.create({
            tenantId,
            customerName: customerName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim()
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create customer', details: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;
        const { customerName, email, phone, address } = req.body;

        if (!customerName?.trim() || !email?.trim() || !phone?.trim() || !address?.trim()) {
            return res.status(400).json({ error: 'All fields (name, email, phone, address) are required' });
        }

        const updated = await Customer.findOneAndUpdate(
            { _id: id, tenantId },
            {
                customerName: customerName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim()
            },
            { returnDocument: 'after' }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer', details: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        const deleted = await Customer.findOneAndDelete({ _id: id, tenantId });
        if (!deleted) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete customer', details: error.message });
    }
};

module.exports = {
    listCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
