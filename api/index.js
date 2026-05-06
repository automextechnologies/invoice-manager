import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import logic from the /server directory instead of /api
// This prevents Vercel from treating every file as a separate function
import invoiceRoutes from '../server/routes/invoiceRoutes.js';
import { connectDb } from '../server/config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api', invoiceRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'API is running' }));

// Initialize DB and dynamic routes
const init = async () => {
    try {
        const dbState = await connectDb();
        if (dbState.connected) {
            const { default: customerRoutes } = await import('../server/routes/customerRoutes.js');
            const { default: companyRoutes } = await import('../server/routes/companyRoutes.js');
            const { default: productRoutes } = await import('../server/routes/productRoutes.js');
            
            app.use('/api/customers', customerRoutes);
            app.use('/api/company', companyRoutes);
            app.use('/api/products', productRoutes);
        }
    } catch (err) {
        console.error('DB Init Error:', err.message);
    }
};

init();

export default app;
