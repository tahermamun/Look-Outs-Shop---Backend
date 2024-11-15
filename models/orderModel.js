import mongoose, { model, Schema } from 'mongoose';

const OrderSchema = new Schema(
    {
        model: {
            type: String,
        },
        color: String,
        quantity: String,
        status: {
            type: String,
            default: 'Pending',
        },
        otp: String,
        showOTP: String,
        storage: String,
        price: String,
        totalPrice: String,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        confirm: {
            type: String,
            default: false,
        },
        country: String,
        state: String,
        address: String,
        postalcode: String,
    },
    { timestamps: true }
);

export const Order = model('Oder', OrderSchema);
