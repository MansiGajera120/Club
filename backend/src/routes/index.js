import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import clubRoutes from './club.routes.js';
import eventRoutes from './event.routes.js';
import favoriteRoutes from './favorite.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';

/**
 * Root API router. Every feature router is mounted here and, in turn, exposed
 * under the configured API prefix (e.g. /api/v1). Feature routers (auth, users,
 * clubs, events, admin) are added in later phases.
 */
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/clubs', clubRoutes);
router.use('/events', eventRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
