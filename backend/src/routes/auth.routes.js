import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  signupSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  verifyOtpSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  googleSchema,
  appleSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Sensitive endpoints get the stricter auth rate limiter.
router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);

router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post(
  '/verify-otp',
  authRateLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtp
);
router.post(
  '/resend-verification',
  authRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/verify-reset-code',
  authRateLimiter,
  validate(verifyResetCodeSchema),
  authController.verifyResetCode
);
router.post(
  '/reset-password',
  authRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/google',
  authRateLimiter,
  validate(googleSchema),
  authController.googleLogin
);
router.post('/apple', authRateLimiter, validate(appleSchema), authController.appleLogin);

// Current user
router.get('/me', authenticate, authController.me);

export default router;
