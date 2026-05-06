const Product = require('../models/Product');

const getTenantId = (req) => req.header('x-tenant-id') || 'default-workspace';

const listProducts = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const products = await Product.find({ tenantId }).sort({ updatedAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch items', details: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { name, price, gstPercent } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Item name is required' });
        }

        const product = await Product.create({
            tenantId,
            name: name.trim(),
            price: Number(price) || 0,
            gstPercent: Number(gstPercent) || 0
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item', details: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;
        const { name, price, gstPercent } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Item name is required' });
        }

        const updated = await Product.findOneAndUpdate(
            { _id: id, tenantId },
            {
                name: name.trim(),
                price: Number(price) || 0,
                gstPercent: Number(gstPercent) || 0
            },
            { returnDocument: 'after' }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update item', details: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        const deleted = await Product.findOneAndDelete({ _id: id, tenantId });
        if (!deleted) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item', details: error.message });
    }
};

module.exports = {
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
