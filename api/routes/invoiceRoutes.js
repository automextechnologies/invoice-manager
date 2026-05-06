const express = require('express');
const router = express.Router();
const { generateInvoice, getNextInvoiceNumber, getAllInvoices } = require('../controllers/invoiceController');

router.post('/generate-invoice', generateInvoice);
router.get('/next-number', getNextInvoiceNumber);
router.get('/', getAllInvoices);

module.exports = router;
