import { Router } from 'express';

import * as favoriteController from '../controllers/favorite.controller.js';
import { authenticate, requireVerifiedEmail } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../enums/index.js';

const router = Router();

// Favorites are a parent-only feature.
router.use(authenticate, authorize(ROLES.PARENT));

router.get('/', favoriteController.listFavorites);
router.post('/:clubId', requireVerifiedEmail, favoriteController.addFavorite);
router.delete('/:clubId', requireVerifiedEmail, favoriteController.removeFavorite);

export default router;
