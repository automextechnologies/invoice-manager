import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        tenantId: {
            type: String,
            required: true,
            index: true
        },
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

customerSchema.index({ tenantId: 1, customerName: 1 });

export default mongoose.model('Customer', customerSchema);
