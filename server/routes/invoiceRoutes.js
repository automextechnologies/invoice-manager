import express from 'express';
import { generateInvoice, getNextInvoiceNumber, getAllInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/generate-invoice', generateInvoice);
router.get('/next-number', getNextInvoiceNumber);
router.get('/', getAllInvoices);

export default router;
