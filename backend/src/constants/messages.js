/**
 * Centralized, human-readable response messages.
 * No message strings should be hardcoded at call sites — reference these instead
 * so wording stays consistent and is trivial to localize later.
 */
export const MESSAGES = Object.freeze({
  COMMON: {
    SUCCESS: 'Request successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'You do not have permission to perform this action',
    TOO_MANY_REQUESTS: 'Too many requests. Please slow down.',
    ROUTE_NOT_FOUND: 'The requested route does not exist',
  },
  HEALTH: {
    OK: 'API is healthy',
  },
  AUTH: {
    REGISTERED: 'Account created. Enter the verification code we emailed you.',
    LOGGED_IN: 'Logged in successfully',
    LOGGED_OUT: 'Logged out successfully',
    TOKEN_REFRESHED: 'Session refreshed',
    EMAIL_VERIFIED: 'Email verified successfully',
    VERIFICATION_SENT:
      'If an account exists and is unverified, a verification code has been sent.',
    PASSWORD_RESET_SENT:
      'If an account exists for that email, a password reset code has been sent.',
    RESET_CODE_VERIFIED: 'Code verified. You can now set a new password.',
    PASSWORD_RESET: 'Password reset successfully. Please log in with your new password.',
    PROFILE: 'Current user',
  },
  CLUB: {
    CREATED: 'Club submitted for approval',
    UPDATED: 'Club updated successfully',
    DELETED: 'Club deleted successfully',
    NOT_FOUND: 'Club not found',
    LOGO_UPDATED: 'Logo updated successfully',
    GALLERY_UPDATED: 'Gallery updated successfully',
    LIST: 'Clubs fetched successfully',
    DETAIL: 'Club fetched successfully',
    FORBIDDEN: 'You can only manage your own club',
    NO_FILE: 'No image file was provided',
  },
  EVENT: {
    CREATED: 'Event created successfully',
    UPDATED: 'Event updated successfully',
    DELETED: 'Event deleted successfully',
    NOT_FOUND: 'Event not found',
    LIST: 'Events fetched successfully',
    DETAIL: 'Event fetched successfully',
    FORBIDDEN: 'You can only manage events for your own club',
    COVER_UPDATED: 'Event cover updated successfully',
  },
  FAVORITE: {
    ADDED: 'Added to favorites',
    REMOVED: 'Removed from favorites',
    LIST: 'Favorites fetched successfully',
  },
  USER: {
    PROFILE: 'Profile fetched successfully',
    UPDATED: 'Profile updated successfully',
    AVATAR_UPDATED: 'Avatar updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_VERIFIED: 'Current password verified',
    NOT_FOUND: 'User not found',
  },
  ADMIN: {
    STATS: 'Dashboard statistics fetched successfully',
    CLUB_CREATED: 'Organization created successfully',
    CLUB_UPDATED: 'Organization updated successfully',
    CLUB_FETCHED: 'Organization fetched successfully',
    CLUB_STATUS_UPDATED: 'Club status updated successfully',
    CLUB_FEATURED_UPDATED: 'Club featured status updated successfully',
    USERS_LIST: 'Users fetched successfully',
    USER_STATUS_UPDATED: 'User status updated successfully',
    ADMIN_INVITED: 'Admin added — a set-password link has been emailed to them',
    CANNOT_MODIFY_ADMIN: 'Admin accounts cannot be modified',
    CANNOT_MODIFY_SELF: 'You cannot change your own account status',
  },
});

export default MESSAGES;
