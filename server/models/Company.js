import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
    {
        tenantId: {
            type: String,
            required: true,
            index: true,
            unique: true // One company profile per tenant
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        pin: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        website: {
            type: String,
            trim: true,
            default: ''
        },
        gstNumber: {
            type: String,
            trim: true,
            default: ''
        },
        merchantName: {
            type: String,
            trim: true,
            default: ''
        },
        accountNumber: {
            type: String,
            trim: true,
            default: ''
        },
        ifsc: {
            type: String,
            trim: true,
            default: ''
        },
        qrCode: {
            type: String, // Store as Base64 string
            default: ''
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Company', companySchema);
