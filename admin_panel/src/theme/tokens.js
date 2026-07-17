/**
 * Design tokens — ported from the Flutter app's palette (`mobile_app/lib/theme/
 * app_colors.dart`) so both clients read as one product: an "Ocean Blue" brand
 * on cool slate neutrals.
 *
 * Keep these in sync with `app_colors.dart`; component code should reference
 * these tokens (or the MUI palette built from them) rather than raw hex.
 */

export const brand = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  secondary: '#38BDF8',
  accent: '#0EA5E9',
};

export const gradients = {
  brand: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%)`,
  brandSoft: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(56,189,248,0.08) 100%)',
};

export const status = {
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

export const neutralLight = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3FB',
  surfaceTint: '#F8FBFE',
  textPrimary: '#111827',
  textSecondary: '#566072',
  textTertiary: '#8A93A3',
  textMuted: '#A7B0BF',
  border: '#E4EAF2',
  borderStrong: '#D2DCEA',
};

// The Flutter app is light-only (`ThemeMode.light`), so there is no dark
// palette to mirror; dark mode resolves to the same neutrals.
export const neutralDark = neutralLight;

export const spacingUnit = 8;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

/**
 * Depth is carried by shadows rather than Material elevation, matching
 * `app_shadows.dart`: a tight contact shadow over a wide ambient one, both
 * tinted with the app's cool shadow tones (#1E3A5F / #0F172A).
 */
export const shadows = {
  sm: '0 1px 3px rgba(30,58,95,0.06), 0 4px 10px rgba(15,23,42,0.05)',
  md: '0 2px 6px rgba(30,58,95,0.07), 0 10px 22px rgba(15,23,42,0.08)',
  lg: '0 4px 10px rgba(30,58,95,0.08), 0 18px 40px rgba(15,23,42,0.12)',
  brand: '0 8px 20px rgba(37,99,235,0.28), 0 2px 6px rgba(37,99,235,0.14)',
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
