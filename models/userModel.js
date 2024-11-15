import jwt from 'jsonwebtoken';
import { model, Schema } from 'mongoose';

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        id: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        role: {
            type: String,
            default: 'customer',
        },
        status: {
            type: String,
            default: 'Pending',
        },
        phoneOTP: {
            type: String,
        },
        emailOTP: {
            type: String,
        },
        orderOTP: {
            type: String,
        },
        phone: {
            type: String,
            unique: true,
            default: null,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// JWT TOKEN
UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export const User = model('User', UserSchema);
