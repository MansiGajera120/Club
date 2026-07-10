/** Keys used for browser storage of auth tokens. */
export const STORAGE_KEYS = {
  accessToken: 'club_admin_access_token',
  refreshToken: 'club_admin_refresh_token',
};

/** React Query cache keys, namespaced by resource. */
export const QUERY_KEYS = {
  me: ['me'],
  dashboard: ['dashboard'],
  clubs: ['clubs'],
  users: ['users'],
  events: ['events'],
};

/** Application route paths — single source of truth for navigation. */
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  clubs: '/clubs',
  clubNew: '/clubs/new',
  clubEdit: '/clubs/:id/edit',
  users: '/users',
  events: '/events',
};

/** Build the edit route for a specific club id. */
export const clubEditPath = (id) => `/clubs/${id}/edit`;
