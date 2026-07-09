import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Service health & readiness probe
 * @access  Public
 */
router.get('/', getHealth);

export default router;
