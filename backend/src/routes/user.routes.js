import { Router } from 'express';

import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

// All user routes require authentication (any role).
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/avatar', uploadSingle('avatar'), userController.uploadAvatar);

export default router;
