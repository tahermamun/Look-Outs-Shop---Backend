import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { saveToken } from '../utils/saveToken.js';
// Twillo
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { sendEmail } from '../utils/sendEmail.js';
import { sixToken } from '../utils/tokenGenerator.js';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Register user
export const registerUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
        return next(new AppError('Email already exists!', 403));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generating OTP token
    // const otp = sixToken().toString();
    // const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, {
    //     expiresIn: 300,
    // });

    // Send OTP on user phone
    // sendEmail(process.env.EMAIL_SUBJECT, req.body.email, otp);

    req.body.password = hashedPassword;
    // req.body.phoneOTP = otpToken;

    const user = await User.create(req.body);

    // client.messages
    //     .create({
    //         body: 'Testing..',
    //         messagingServiceSid: 'MGded1e816c04908e199d4b85d0c6ddfc2',
    //         to: '+8801790841023',
    //     })
    //     .then((message) => console.log(message.sid))
    //     .catch((err) => {
    //         console.log(err);
    //     });

    saveToken(user, 200, res);
});

// ---------------------- Verify Phone-----------------------
export const verifyPhone = catchAsync(async (req, res, next) => {
    const { token } = req.query;

    if (token) {
        const decodedData = jwt.verify(req.user.phoneOTP, process.env.JWT_SECRET);
        if (decodedData.otp === token) {
            // Verify token
            await User.findByIdAndUpdate(
                req.user._id,
                { $set: { isPhoneVerified: true } },
                {
                    new: true,
                    runValidators: 'true',
                    useFindAndModify: 'false',
                }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Phone Verified!',
            });
        } else {
            return next(new AppError('Invalid Token!', 401));
        }
    } else {
        const otp = sixToken().toString();
        const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, {
            expiresIn: 300,
        });
        // Send token on phone
        // console.log(otp);
        sendEmail(process.env.EMAIL_SUBJECT, req.user.email, otp);
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { phoneOTP: otpToken } },
            {
                new: true,
                runValidators: 'true',
                useFindAndModify: 'false',
            }
        );

        return res.status(200).json({
            status: 'success',
            message: 'OTP send on your phone.',
        });
    }
});

// ---------------------- Verify Email-----------------------
export const verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.query;

    if (token) {
        const decodedData = jwt.verify(req.user.emailOTP, process.env.JWT_SECRET);
        if (decodedData.otp === token) {
            // Verify token
            await User.findByIdAndUpdate(
                req.user._id,
                { $set: { isEmailVerified: true } },
                {
                    new: true,
                    runValidators: 'true',
                    useFindAndModify: 'false',
                }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Email Verified!',
            });
        } else {
            return next(new AppError('Invalid Token!', 401));
        }
    } else {
        const otp = sixToken().toString();
        const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, {
            expiresIn: 300,
        });
        // Send token on Email

        sendEmail(process.env.EMAIL_SUBJECT, req.user.email, otp);
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { emailOTP: otpToken } },
            {
                new: true,
                runValidators: 'true',
                useFindAndModify: 'false',
            }
        );

        return res.status(200).json({
            status: 'success',
            message: 'OTP send on your Email.',
        });
    }
});

// Delete User
export const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.query;
    const user = await User.findById(id);
    if (!user) return next(AppError('User not found', 404));

    const roles = ['admin', 'superadmin'];

    if (roles.includes(user.role)) {
        return next(new AppError(`You cannot remove  ${user.role}`));
    }

    await User.findByIdAndDelete({ _id: id });

    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
    });
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please enter valid email & password', 304));
    }

    const user = await User.findOne({ email });

    if (!user) return next(new AppError('User not found!', 403));

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) return next(new AppError('Wrong password'), 304);

    saveToken(user, 200, res);
});

// Logout User
export const logout = catchAsync(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged Out Successfully',
    });
});

// Get login user
export const loginUser = catchAsync(async (req, res, next) => {
    const { _id } = req.user;
    const user = await User.findById({ _id });
    if (!user) {
        return next(new AppError('Please login first!'));
    }
    res.status(200).json({
        status: 'success',
        data: user,
    });
});

// Get  User all user
export const getAllUsers = catchAsync(async (req, res, next) => {
    const { id } = req.query;
    const filters = {};

    if (id) {
        filters._id = id;
    }

    const users = await User.find(filters)
        .select('-phoneOTP -emailOTP -password')
        .lean()
        .sort({ createdAt: -1 });

    if (!users) {
        return next(new AppError('User not found!', 403));
    }

    res.status(200).json({
        status: 'success',
        data: users,
    });
});

// Forgot Password
export const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.query;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('Email Not Found!', 404));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 300,
    });

    const url = `${process.env.CLIENT_URL}forgot-password/${token}`;

    sendEmail(process.env.EMAIL_SUBJECT, email, url);

    res.status(200).json({
        status: 'success',
        message: 'Verify Your Email',
    });
});

// Verify URL and Change Password
export const verifyForgotPassword = catchAsync(async (req, res, next) => {
    const { token, password } = req.query;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedData.id);

    if (!user) {
        return next(new AppError('Authentication failed', 404));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Password succesfully Updated!',
    });
});

// Change Password
export const changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword } = req.query;

    if (!oldPassword || !newPassword) {
        return next(new AppError('Invalid Credentials!'));
    }

    const user = await User.findById(req.user._id);

    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatched) return next(new AppError("Password didn't match!"));

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Password succesfully Updated!',
    });
});

// Change User Role
export const changeUserRole = catchAsync(async (req, res, next) => {
    const { id, role } = req.query;

    if (id === req.user._id) return next(new AppError("You can't change yourself!"));

    const user = await User.findById(id);
    if (!user) return next(AppError('User not found', 404));

    const roles = ['superadmin'];

    if (roles.includes(user.role)) {
        return next(new AppError(`You can't change ${user.role}`));
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Role updated successfully',
    });
});
