import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    tenantId: { type: String, required: true, default: 'default-workspace' },
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    email: { type: String },
    date: { type: String, required: true },
    items: [{
        name: String,
        qty: Number,
        price: Number,
        gstPercent: Number,
        total: Number
    }],
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, default: 'generated' }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
