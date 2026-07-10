/**
 * Role-based access control roles. Used everywhere authorization is enforced.
 */
export const ROLES = Object.freeze({
  PARENT: 'parent',
  CLUB_OWNER: 'club_owner',
  ADMIN: 'admin',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

/**
 * Lifecycle status of a club as it moves through moderation.
 */
export const CLUB_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  HIDDEN: 'hidden',
});

export const CLUB_STATUS_VALUES = Object.freeze(Object.values(CLUB_STATUS));

/**
 * Account status for any user.
 */
export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  DISABLED: 'disabled',
});

export const USER_STATUS_VALUES = Object.freeze(Object.values(USER_STATUS));

/**
 * Supported authentication providers.
 */
export const AUTH_PROVIDER = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
  APPLE: 'apple',
});

export const AUTH_PROVIDER_VALUES = Object.freeze(Object.values(AUTH_PROVIDER));

/**
 * Gender categories a club may cater to (used for filtering).
 */
export const GENDER = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  MIXED: 'mixed',
});

export const GENDER_VALUES = Object.freeze(Object.values(GENDER));
