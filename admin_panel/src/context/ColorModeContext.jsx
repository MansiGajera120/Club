import { ThemeProvider, CssBaseline } from '@mui/material';

import { getTheme } from '@/theme';

// The admin panel is light-only (dark mode removed).
const theme = getTheme('light');

/** Provides the light MUI theme + baseline reset for the whole app. */
export function ColorModeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default ColorModeProvider;
