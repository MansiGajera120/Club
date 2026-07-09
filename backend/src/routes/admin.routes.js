import { Router } from 'express';

import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLES } from '../enums/index.js';
import {
  updateClubStatusSchema,
  setFeaturedSchema,
  listClubsQuerySchema,
  listUsersQuerySchema,
  setUserStatusSchema,
  listEventsQuerySchema,
} from '../validators/admin.validator.js';

const router = Router();

// Every admin route requires an authenticated admin.
router.use(authenticate, authorize(ROLES.ADMIN));

// Dashboard
router.get('/stats', adminController.getStats);

// Clubs / moderation
router.get('/clubs', validate(listClubsQuerySchema, 'query'), adminController.listClubs);
router.patch(
  '/clubs/:id/status',
  validate(updateClubStatusSchema),
  adminController.updateClubStatus
);
router.patch(
  '/clubs/:id/featured',
  validate(setFeaturedSchema),
  adminController.setClubFeatured
);
router.delete('/clubs/:id', adminController.deleteClub);

// Users
router.get('/users', validate(listUsersQuerySchema, 'query'), adminController.listUsers);
router.patch(
  '/users/:id/status',
  validate(setUserStatusSchema),
  adminController.setUserStatus
);

// Events
router.get(
  '/events',
  validate(listEventsQuerySchema, 'query'),
  adminController.listEvents
);
router.delete('/events/:id', adminController.deleteEvent);

export default router;
