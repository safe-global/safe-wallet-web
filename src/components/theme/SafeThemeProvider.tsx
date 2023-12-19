import * as React from 'react';
import { PaletteMode, Theme, ThemeProvider } from '@mui/material';
import createSafeTheme from './safeTheme';

// This component is necessary to make the theme available in the library components
// Is not enough wrapping the client app with the regular ThemeProvider as the library components
// are not aware of the theme context:
// https://github.com/mui/material-ui/issues/32806
// https://stackoverflow.com/questions/69072004/material-ui-theme-not-working-in-shared-component
type SafeThemeProviderProps = {
  children: (theme: Theme) => React.ReactNode;
  mode: PaletteMode;
};

const SafeThemeProvider: React.FC<SafeThemeProviderProps> = ({
  children,
  mode,
}) => {
  const theme = React.useMemo(() => createSafeTheme(mode), [mode]);

  return <ThemeProvider theme={theme}>{children(theme)}</ThemeProvider>;
};

export default SafeThemeProvider;
