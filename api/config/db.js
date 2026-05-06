const connectDb = async () => {
    let mongoose;
    try {
        mongoose = require('mongoose');
    } catch (error) {
        console.warn('mongoose is not installed yet. Customer API is disabled until dependency is installed.');
        return { connected: false };
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.warn('MONGODB_URI is not set. Customer API is disabled until MongoDB credentials are configured.');
        return { connected: false };
    }

    const dbName = process.env.MONGODB_DB_NAME || 'automex_invoice';
    try {
        await mongoose.connect(mongoUri, {
            dbName: dbName
        });
        console.log(`Connected to MongoDB database: ${dbName}`);
        return { connected: true };
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        return { connected: false };
    }
};

module.exports = { connectDb };
