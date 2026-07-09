import { Router } from 'express';

import * as eventController from '../controllers/event.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { ROLES } from '../enums/index.js';
import {
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
} from '../validators/event.validator.js';

const router = Router();

// ---- Public ----
router.get(
  '/',
  optionalAuthenticate,
  validate(listEventsQuerySchema, 'query'),
  eventController.listEvents
);
router.get(
  '/mine',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  validate(listEventsQuerySchema, 'query'),
  eventController.listMyEvents
);
router.get('/:id', eventController.getEvent);

// ---- Club owner / admin (ownership enforced in the service) ----
router.post(
  '/',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  validate(createEventSchema),
  eventController.createEvent
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  validate(updateEventSchema),
  eventController.updateEvent
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  eventController.deleteEvent
);
router.post(
  '/:id/cover',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  uploadSingle('cover'),
  eventController.uploadCover
);

export default router;
