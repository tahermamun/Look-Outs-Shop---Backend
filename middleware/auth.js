import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const isAuthenticatedUser = catchAsync(async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return next(new AppError('Please login to access', 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);
    next();
});
