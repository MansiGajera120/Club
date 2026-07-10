import { Router } from 'express';

import * as clubController from '../controllers/club.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  authenticate,
  optionalAuthenticate,
  requireVerifiedEmail,
} from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { uploadSingle, uploadMany } from '../middlewares/upload.middleware.js';
import { ROLES } from '../enums/index.js';
import {
  createClubSchema,
  updateClubSchema,
  listClubsQuerySchema,
  removeGallerySchema,
} from '../validators/club.validator.js';

const router = Router();

// ---- Public (optional auth to annotate favorites) ----
router.get(
  '/',
  optionalAuthenticate,
  validate(listClubsQuerySchema, 'query'),
  clubController.listClubs
);

// Owner's own clubs — registered before '/:id' so 'me' isn't treated as an id.
router.get(
  '/me',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  clubController.getMyClubs
);

router.get('/:id', optionalAuthenticate, clubController.getClub);

// ---- Club owner (ownership enforced in the service) ----
router.post(
  '/',
  authenticate,
  authorize(ROLES.CLUB_OWNER),
  requireVerifiedEmail,
  validate(createClubSchema),
  clubController.createClub
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  requireVerifiedEmail,
  validate(updateClubSchema),
  clubController.updateClub
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  requireVerifiedEmail,
  clubController.deleteClub
);

router.post(
  '/:id/logo',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  requireVerifiedEmail,
  uploadSingle('logo'),
  clubController.uploadLogo
);

router.post(
  '/:id/gallery',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  requireVerifiedEmail,
  uploadMany('images', 10),
  clubController.addGallery
);

router.delete(
  '/:id/gallery',
  authenticate,
  authorize(ROLES.CLUB_OWNER, ROLES.ADMIN),
  requireVerifiedEmail,
  validate(removeGallerySchema),
  clubController.removeGallery
);

export default router;
