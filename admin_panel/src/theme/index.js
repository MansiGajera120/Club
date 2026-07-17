import { createTheme } from '@mui/material/styles';

import {
  brand,
  gradients,
  status,
  neutralLight,
  neutralDark,
  spacingUnit,
  radius,
  shadows,
  fontFamily,
} from './tokens';

/**
 * Build the MUI theme for a given mode ('light' | 'dark') from the shared
 * design tokens — the Flutter app's "Ocean Blue" palette: a #2563EB→#38BDF8
 * brand on cool slate neutrals.
 *
 * @param {'light'|'dark'} mode
 */
export function getTheme(mode) {
  const isDark = mode === 'dark';
  const neutral = isDark ? neutralDark : neutralLight;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: brand.primary,
        dark: brand.primaryDark,
        light: brand.primaryLight,
        contrastText: '#FFFFFF',
      },
      secondary: { main: brand.secondary, contrastText: '#FFFFFF' },
      info: { main: status.info },
      success: { main: status.success },
      warning: { main: status.warning },
      error: { main: status.danger },
      background: { default: neutral.background, paper: neutral.surface },
      text: { primary: neutral.textPrimary, secondary: neutral.textSecondary },
      divider: neutral.border,
    },
    spacing: spacingUnit,
    shape: { borderRadius: radius.md },
    typography: {
      fontFamily,
      h1: { fontFamily, fontSize: '2.125rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' },
      h2: { fontFamily, fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
      h3: { fontFamily, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.015em' },
      h4: { fontFamily, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
      h5: { fontFamily, fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.4 },
      h6: { fontFamily, fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.45 },
      caption: { fontSize: '0.75rem', fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: neutral.background,
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: neutral.borderStrong,
            borderRadius: 999,
            border: `2px solid ${neutral.background}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: neutral.textMuted,
          },
          '::selection': {
            backgroundColor: 'rgba(37,99,235,0.22)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            paddingInline: 20,
            minHeight: 44,
            fontWeight: 600,
            transition: 'transform .15s ease, box-shadow .2s ease, background .2s ease',
          },
          containedPrimary: {
            backgroundImage: gradients.brand,
            boxShadow: shadows.brand,
            '&:hover': { boxShadow: shadows.brand, transform: 'translateY(-1px)', filter: 'brightness(1.04)' },
            '&:active': { transform: 'translateY(0)' },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': { borderWidth: 1.5, backgroundColor: 'rgba(37,99,235,0.05)' },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            border: `1px solid ${neutral.border}`,
            boxShadow: shadows.sm,
            backgroundImage: 'none',
            transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: radius.lg },
          outlined: { borderColor: neutral.border },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(21,27,46,0.72)' : 'rgba(255,255,255,0.72)',
            backdropFilter: 'saturate(180%) blur(12px)',
            borderBottom: `1px solid ${neutral.border}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: neutral.surface,
            borderRight: `1px solid ${neutral.border}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', fullWidth: true },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            backgroundColor: neutral.surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: neutral.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brand.primaryLight },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brand.primary,
              borderWidth: 1.8,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            marginBlock: 2,
            '&.Mui-selected': {
              backgroundColor: 'rgba(37,99,235,0.10)',
              color: brand.primary,
              '&:hover': { backgroundColor: 'rgba(37,99,235,0.14)' },
              '& .MuiListItemIcon-root': { color: brand.primary },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radius.pill, fontWeight: 600 },
          outlined: { borderColor: neutral.border },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            border: 'none', // Remove any container borders when tables are in cards
            boxShadow: 'none',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              backgroundColor: neutral.surfaceMuted,
            },
            '& .MuiTableCell-head': {
              backgroundColor: 'transparent',
              color: neutral.textSecondary,
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: 'normal',
              textTransform: 'none',
              borderBottom: 'none',
              paddingBlock: 16,
            },
            '& .MuiTableCell-head:first-of-type': {
              borderTopLeftRadius: radius.md,
              borderBottomLeftRadius: radius.md,
              paddingLeft: 24,
            },
            '& .MuiTableCell-head:last-of-type': {
              borderTopRightRadius: radius.md,
              borderBottomRightRadius: radius.md,
              paddingRight: 24,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { 
            borderColor: neutral.border,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          },
          body: {
            paddingBlock: 24,
            color: neutral.textPrimary,
            fontSize: '0.95rem',
            fontWeight: 500,
            '&:first-of-type': {
              paddingLeft: 24,
            },
            '&:last-of-type': {
              paddingRight: 24,
            },
          }
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color .12s ease',
            '&:last-child .MuiTableCell-body': {
              borderBottom: 'none',
            },
            '&:hover': { backgroundColor: neutral.surfaceTint },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: '#0F172A',
            fontSize: '0.75rem',
            borderRadius: radius.sm,
            padding: '6px 10px',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: 3 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, minHeight: 44 },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            borderBottom: 'none',
          },
          select: {
            border: `1px solid ${neutral.border}`,
            borderRadius: radius.md,
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: 12,
            backgroundColor: neutral.surface,
          },
          toolbar: {
            paddingInline: 24,
            minHeight: 64,
          },
          displayedRows: {
            marginInline: 'auto', // to center the text "Showing X out of Y..." if possible
            color: neutral.textSecondary,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 6 },
        },
      },
    },
  });
}

/** Default light theme, for consumers that don't need mode switching. */
export const theme = getTheme('light');

export default theme;
