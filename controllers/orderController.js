import { Order } from '../models/orderModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { sixToken } from '../utils/tokenGenerator.js';

import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

export const createOrder = catchAsync(async (req, res, next) => {
    const otp = sixToken().toString();
    req.body.user = req.user._id;

    const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, {
        expiresIn: 300,
    });
    req.body.otp = otpToken;

    const newOrder = await Order.create(req.body);

    // Send token on phone here
    // |
    // |

    // Send token on Email
    sendEmail(process.env.EMAIL_SUBJECT, req.user.email, otp);

    res.status(200).json({
        status: 'success',
        message: 'Please confirm Order!',
        data: newOrder,
    });
});

// Confirm order
export const confirmOrder = catchAsync(async (req, res, next) => {
    const { token, id } = req.query;
    const order = await Order.findById(id);

    if (!order) return next(new AppError('Order not found!', 404));

    const decodedData = jwt.verify(order.otp, process.env.JWT_SECRET);

    if (decodedData.otp === token) {
        // Verify token
        await Order.findByIdAndUpdate(
            order._id,
            { $set: { confirm: true, showOTP: decodedData.otp } },
            {
                new: true,
                runValidators: 'true',
                useFindAndModify: 'false',
            }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Order placed succesfully!',
        });
    } else {
        return next(new AppError('Invalid Token!', 401));
    }
});

// Get all orders
export const getAllOrders = catchAsync(async (req, res, next) => {
    const { id } = req.query;
    const filter = {
        confirm: true,
    };
    if (id) {
        filter._id = id;
    }

    const orders = await Order.find(filter)
        .select('-otp')
        .lean()
        .sort({ createdAt: -1 })
        .populate('user', ['phone', 'email', 'id']);

    res.status(200).json({
        status: 'success',
        data: orders,
    });
});

// Get login-user orders
export const getUserOrder = catchAsync(async (req, res, next) => {
    const { id } = req.query;
    const filter = {
        confirm: true,
    };
    if (id) {
        filter.user = id;
    }

    const orders = await Order.find(filter)
        .select('-otp')
        .lean()
        .sort({ createdAt: -1 })
        .populate('user', ['phone', 'email']);

    res.status(200).json({
        status: 'success',
        data: orders,
    });
});

// Update order status
export const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status, id } = req.query;
    console.log(status, id);

    await Order.findByIdAndUpdate(
        id,
        { $set: { status } },
        {
            new: true,
            runValidators: 'true',
            useFindAndModify: 'false',
        }
    );

    res.status(200).json({
        status: 'success',
        message: `Status Updated to ${status}`,
    });
});

// Delete order
export const deleteOrder = catchAsync(async (req, res, next) => {
    const { id } = req.query;

    await Order.findByIdAndDelete({ _id: id });

    res.status(200).json({
        status: 'success',
        message: `Order Deleted successfully!`,
    });
});
