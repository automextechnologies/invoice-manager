const express = require('express');
const cors = require('cors');
require('dotenv').config();

const invoiceRoutes = require('./routes/invoiceRoutes');
const { connectDb } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Use default permissive CORS for debugging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', invoiceRoutes);

// Add a test route
app.get('/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// Start server
const startServer = async () => {
    try {
        const dbState = await connectDb();
        if (dbState.connected) {
            const customerRoutes = require('./routes/customerRoutes');
            const companyRoutes = require('./routes/companyRoutes');
            const productRoutes = require('./routes/productRoutes');
            app.use('/api/customers', customerRoutes);
            app.use('/api/company', companyRoutes);
            app.use('/api/products', productRoutes);
        } else {
            const unavailableHandler = (req, res) => {
                res.status(503).json({
                    error: 'Database API unavailable',
                    details: 'Configure MongoDB credentials and install mongoose to enable data persistence.'
                });
            };
            app.use('/api/customers', unavailableHandler);
            app.use('/api/company', unavailableHandler);
            app.use('/api/products', unavailableHandler);
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
