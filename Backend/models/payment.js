import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    order_id: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "LKR" },
    status: { type: String, default: "Pending" },  // Possible values: Pending, Paid, Failed
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Check if the model is already compiled
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
