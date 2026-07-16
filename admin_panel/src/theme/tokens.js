/**
 * Design tokens — "ClubHub Admin": clean light with orange accent.
 * Inspired by Thrive Tracker style.
 */

export const brand = {
  primary: '#F97316',
  primaryDark: '#EA6C0A',
  primaryLight: '#FB923C',
  secondary: '#FDBA74',
  accent: '#FED7AA',
};

export const gradients = {
  brand: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryLight} 100%)`,
  brandSoft: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(251,146,60,0.08) 100%)',
};

export const status = {
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
};

export const neutralLight = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FA',
  textPrimary: '#262525',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#EEEFF2',
};

export const neutralDark = neutralLight;

export const spacingUnit = 8;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const shadows = {
  sm: '0 1px 4px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
  md: '0 4px 16px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
  lg: '0 12px 40px rgba(0,0,0,0.10)',
  brand: '0 6px 20px rgba(249,115,22,0.30)',
};

export const fontFamily = [
  '"Plus Jakarta Sans"',
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'sans-serif',
].join(',');
