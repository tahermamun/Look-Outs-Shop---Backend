import AppError from '../utils/appError.js';

// castError handler
const castErrorHandler = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// duplicated field value
const duplicatedFieldValueHandler = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    // const message = `Duplicate field value: ${value}. Please use another value!`;

    const key = Object.keys(err.keyValue);

    return new AppError(`Duplicate field value: ${key}. Please use another value!`, 400);
};

// validation error
const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// jwt error
const jwtErrorHandler = () => new AppError('Invalid token. Please login again.', 401);

const jwtExpiredErrorHandler = () => new AppError('Expired token. Please login again.', 401);

export default (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'production') {
        let err = { ...error, message: error.message };

        if (err.name === 'CastError') err = castErrorHandler(err);
        if (err.code === 11000) err = duplicatedFieldValueHandler(err);
        if (err.code === 'E11000') err = duplicatedFieldValueHandler(err);
        if (err.name === 'ValidationError') err = validationErrorHandler(err);
        if (err.name === 'JsonWebTokenError') err = jwtErrorHandler();
        if (err.name === 'TokenExpiredError') err = jwtExpiredErrorHandler();

        // operational error: trusted error
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            // programming/unknown error
            console.error('Error', err);
            res.status(500).json({
                status: 'error',
                message: 'something went wrong!',
            });
        }
    } else {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            error,
            stack: error.stack,
        });
    }
};
