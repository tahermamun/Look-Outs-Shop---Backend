import { Router } from 'express';
import {
    confirmOrder,
    createOrder,
    deleteOrder,
    getAllOrders,
    getUserOrder,
    updateOrderStatus,
} from '../controllers/orderController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Create order
router.post('/', isAuthenticatedUser, createOrder);

// Update order status
router.put('/', isAuthenticatedUser, restrictTo('admin', 'superadmin'), updateOrderStatus);

// Update order
router.put('/', isAuthenticatedUser, restrictTo('admin', 'superadmin'), updateOrderStatus);

// Delete order
router.delete('/', isAuthenticatedUser, restrictTo('admin', 'superadmin'), deleteOrder);

// Get orders
router.get('/', isAuthenticatedUser, restrictTo('admin', 'superadmin'), getAllOrders);

// ------------------------------

// Get login users order
router.get('/user', isAuthenticatedUser, getUserOrder);

// Verify Order
router.get('/verify_order', isAuthenticatedUser, confirmOrder);

export const orderRoute = router;
