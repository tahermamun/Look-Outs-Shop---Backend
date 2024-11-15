import { Router } from 'express';
import {
    changePassword,
    changeUserRole,
    deleteUser,
    forgotPassword,
    getAllUsers,
    login,
    loginUser,
    logout,
    registerUser,
    verifyEmail,
    verifyForgotPassword,
    verifyPhone,
} from '../controllers/userController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Create or Register User
router.post('/register', registerUser);

// Login user
router.post('/login', login);

// Lougout user
router.get('/logout', logout);

// Get login user
router.get('/login_user', isAuthenticatedUser, loginUser);

// Get all user admin
router.get('/all_user', isAuthenticatedUser, restrictTo('admin', 'superadmin'), getAllUsers);

// Delete User
router.delete('/', isAuthenticatedUser, restrictTo('superadmin'), deleteUser);

// Change user role
router.patch('/', isAuthenticatedUser, restrictTo('superadmin'), changeUserRole);

// Forgot Password
router.get('/forgot_password', forgotPassword);
router.get('/verify_forgot_password', verifyForgotPassword);

// Change Password
router.post('/change_password', isAuthenticatedUser, changePassword);

// Verify Phone
router.get('/verify_phone', isAuthenticatedUser, verifyPhone);
router.get('/verify_email', isAuthenticatedUser, verifyEmail);

export const userRoute = router;
