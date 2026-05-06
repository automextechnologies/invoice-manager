import mongoose from 'mongoose';

export const connectDb = async () => {
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
