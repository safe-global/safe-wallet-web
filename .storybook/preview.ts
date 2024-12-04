import type { Preview } from '@storybook/react'

import ThemeProvider from '@mui/material/styles/ThemeProvider'
import CssBaseline from '@mui/material/CssBaseline'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import createSafeTheme from '../src/components/theme/safeTheme'

import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    withThemeFromJSXProvider({
      GlobalStyles: CssBaseline,
      Provider: ThemeProvider,
      themes: {
        light: createSafeTheme('light'),
        dark: createSafeTheme('dark'),
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
