import { Router } from 'express';

import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadSingle, uploadMany } from '../middlewares/upload.middleware.js';
import { removeGallerySchema } from '../validators/club.validator.js';
import { ROLES } from '../enums/index.js';
import {
  adminCreateClubSchema,
  adminUpdateClubSchema,
  updateClubStatusSchema,
  setFeaturedSchema,
  createAdminSchema,
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

// Clubs / moderation + full admin CRUD
router.get('/clubs', validate(listClubsQuerySchema, 'query'), adminController.listClubs);
router.post('/clubs', validate(adminCreateClubSchema), adminController.createClub);
router.get('/clubs/:id', adminController.getClub);
router.patch('/clubs/:id', validate(adminUpdateClubSchema), adminController.updateClub);
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

// Logo + gallery upload for admin-managed clubs.
router.post(
  '/clubs/:id/logo',
  uploadSingle('logo'),
  adminController.uploadLogo
);
router.post(
  '/clubs/:id/gallery',
  uploadMany('images', 10),
  adminController.addGallery
);
router.delete(
  '/clubs/:id/gallery',
  validate(removeGallerySchema),
  adminController.removeGallery
);

// Admins
router.post('/admins', validate(createAdminSchema), adminController.createAdmin);

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
