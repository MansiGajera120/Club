import { Router } from 'express';

import * as userController from '../controllers/user.controller.js';
import { authenticate, requireVerifiedEmail } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { updateProfileSchema, changePasswordSchema, verifyPasswordSchema } from '../validators/user.validator.js';

const router = Router();

// All user routes require authentication (any role).
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch(
  '/me',
  requireVerifiedEmail,
  validate(updateProfileSchema),
  userController.updateMe
);
router.post(
  '/me/avatar',
  requireVerifiedEmail,
  uploadSingle('avatar'),
  userController.uploadAvatar
);
router.patch(
  '/me/password',
  requireVerifiedEmail,
  validate(changePasswordSchema),
  userController.changePassword
);
router.post(
  '/me/password/verify',
  requireVerifiedEmail,
  validate(verifyPasswordSchema),
  userController.verifyPassword
);

export default router;
