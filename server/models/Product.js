import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        tenantId: {
            type: String,
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        gstPercent: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

productSchema.index({ tenantId: 1, name: 1 });

export default mongoose.model('Product', productSchema);
