import { Router } from 'express';
import { demoRoutes } from './demoRoutes.js';
import { orderRoute } from './orderRoute.js';
import { userRoute } from './userRoute.js';

const router = Router();

router.use('/demo', demoRoutes);
router.use('/user', userRoute);
router.use('/order', orderRoute);

export default router;
