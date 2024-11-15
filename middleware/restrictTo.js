import AppError from '../utils/appError.js';

// restrict by role - authorization
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Access Denied.', 403));
        }

        next();
    };
};
