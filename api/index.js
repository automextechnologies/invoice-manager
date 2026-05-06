import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Static imports for all routes to ensure they are registered synchronously
import invoiceRoutes from '../server/routes/invoiceRoutes.js';
import customerRoutes from '../server/routes/customerRoutes.js';
import companyRoutes from '../server/routes/companyRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import { connectDb } from '../server/config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Register routes synchronously
// Order specific routes before the general /api route to ensure correct matching
app.use('/api/customers', customerRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/products', productRoutes);
app.use('/api', invoiceRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'API is running' }));

// Initiate DB connection in background
connectDb().catch(err => {
    console.error('Initial DB Connection Error:', err.message);
});

export default app;

