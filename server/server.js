import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import invoiceRoutes from './routes/invoiceRoutes.js';
import { connectDb } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health checks (defined BEFORE other routes to ensure they always work)
app.get('/health', (req, res) => res.json({ status: 'API is running' }));
app.get('/api/health', (req, res) => res.json({ status: 'API is running' }));

// Serve static files from the React app
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Routes
app.use('/api', invoiceRoutes);

// Start server
const startServer = async () => {
    try {
        const dbState = await connectDb();
        if (dbState.connected) {
            const { default: customerRoutes } = await import('./routes/customerRoutes.js');
            const { default: companyRoutes } = await import('./routes/companyRoutes.js');
            const { default: productRoutes } = await import('./routes/productRoutes.js');
            app.use('/api/customers', customerRoutes);
            app.use('/api/company', companyRoutes);
            app.use('/api/products', productRoutes);
        } else {
            const unavailableHandler = (req, res) => {
                res.status(503).json({
                    error: 'Database API unavailable',
                    details: 'Configure MongoDB credentials to enable data persistence.'
                });
            };
            app.use('/api/customers', unavailableHandler);
            app.use('/api/company', unavailableHandler);
            app.use('/api/products', unavailableHandler);
        }

        // Handle React routing, return all requests to React app
        app.use((req, res, next) => {
            if (req.path.startsWith('/api')) {
                return next();
            }
            res.sendFile(path.join(distPath, 'index.html'));
        });

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
