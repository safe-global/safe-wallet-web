import { Color, createTheme, PaletteColor, PaletteColorOptions } from '@mui/material'

import {
  black,
  error,
  gray,
  green,
  orange,
  primary,
  primaryBlack,
  primaryGreen,
  red,
  secondaryBlack,
  warning,
} from '@/styles/colors'

interface ThemeColors {
  black: Pick<Color, 300 | 400 | 500 | 600>
  gray: Pick<Color, 300 | 400 | 500>
  red: Pick<Color, 200 | 300 | 400>
  green: Pick<Color, 200 | 400>
  orange: Pick<Color, 200 | 300 | 400 | 500>
  // Not listed in colour scheme but present in wireframes
  secondaryBlack: Pick<Color, 300>
  primaryBlack: Pick<Color, 500>
  primaryGreen: Pick<Color, 200>
}

declare module '@mui/material/styles' {
  interface Palette extends ThemeColors {}
  interface PaletteOptions extends ThemeColors {}
}

const theme = createTheme({
  palette: {
    primary: {
      main: primary[400],
      //
      200: primary[200],
      300: primary[300],
      400: primary[400],
      500: primary[500],
      600: primary[600],
    },
    error: {
      main: red[400],
      //
      600: error[600],
    },
    warning: {
      main: orange[400],
      //
      600: warning[600],
    },
    // Custom colors
    black: {
      300: black[300],
      400: black[400],
      500: black[500],
      600: black[600],
    },
    gray: {
      300: gray[300],
      400: gray[400],
      500: gray[500],
    },
    red: {
      200: red[200],
      300: red[300],
      400: red[400],
    },
    green: {
      200: green[200],
      400: green[400],
    },
    orange: {
      200: orange[200],
      300: orange[300],
      400: orange[400],
      500: orange[500],
    },
    // Not listed in colour scheme but present in wireframes
    secondaryBlack: {
      300: secondaryBlack[300],
    },
    primaryBlack: {
      500: primaryBlack[500],
    },
    primaryGreen: {
      200: primaryGreen[200],
    },
  },
  typography: {
    allVariants: {
      color: primaryBlack[500],
    },
    fontFamily: [
      'Averta',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Segoe UI',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
})

export default theme
