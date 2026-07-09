/**
 * Design tokens — "Sunrise Bloom": bright warm cream with coral accent.
 * Light-only; mirrors the Flutter app.
 */

export const brand = {
  primary: '#FF5A5F',
  primaryDark: '#E04E53',
  primaryLight: '#FF7B7F',
  secondary: '#FF8E6B',
  accent: '#FFB347',
};

export const gradients = {
  brand: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%)`,
  brandSoft: 'linear-gradient(135deg, rgba(255,90,95,0.08) 0%, rgba(255,142,107,0.08) 100%)',
};

export const status = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

export const neutralLight = {
  background: '#FFFBF8',
  surface: '#FFFFFF',
  surfaceMuted: '#FFF3F0',
  textPrimary: '#1C1C28',
  textSecondary: '#64647A',
  textTertiary: '#9898A8',
  border: '#F2E8E5',
};

export const neutralDark = neutralLight;

export const spacingUnit = 8;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const shadows = {
  sm: '0 1px 3px rgba(42, 42, 53, 0.05), 0 2px 8px rgba(42, 42, 53, 0.04)',
  md: '0 4px 16px rgba(42, 42, 53, 0.06), 0 8px 24px rgba(42, 42, 53, 0.05)',
  lg: '0 12px 40px rgba(42, 42, 53, 0.10)',
  brand: '0 6px 20px rgba(255, 90, 95, 0.25)',
};

export const fontFamily = [
  'Outfit',
  'DM Sans',
  'Plus Jakarta Sans',
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'sans-serif',
].join(',');
