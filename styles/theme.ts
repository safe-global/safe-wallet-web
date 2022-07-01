import { Color, createTheme } from '@mui/material'

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
  primaryGray,
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
  primaryGray: Pick<Color, 400>
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
    primaryGray: {
      400: primaryGray[400],
    },
  },
  typography: {
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
    allVariants: {
      color: primaryBlack[500],
    },
    h1: {
      fontSize: '32px',
      lineHeight: '36px',
      fontWeight: 700,
    },
    h2: {
      fontSize: '27px',
      lineHeight: '34px',
      fontWeight: 700,
    },
    h3: {
      fontSize: '24px',
      lineHeight: '30px',
    },
    h4: {
      fontSize: '20px',
      lineHeight: '26px',
    },
    h5: {
      fontSize: '16px',
      fontWeight: 700,
    },
    body1: {
      fontSize: '16px',
      lineHeight: '22px',
    },
    body2: {
      fontSize: '14px',
      lineHeight: '22px',
    },
    caption: {
      fontSize: '12px',
      lineHeight: '16px',
    },
    overline: {
      fontSize: '11px',
      lineHeight: '14px',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '8px',
          // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
          borderColor: theme.palette.primary[400],
          textTransform: 'none',
          '&.Mui-disabled': {
            color: '#fff',
            backgroundColor: theme.palette.secondaryBlack[300],
          },
        }),
        outlined: {
          border: '2px solid',
          '&:hover': {
            border: '2px solid',
          },
        },
        sizeLarge: { fontSize: '16px' },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '8px',
          border: `2px solid ${theme.palette.gray[500]}`,
          '&::before': {
            content: 'none',
          },
        }),
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-expanded': {
            borderBottom: `2px solid ${theme.palette.gray[500]}`,
          },
        }),
        content: { margin: '0px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          borderRadius: theme.spacing(1),
          boxSizing: 'border-box',
          border: '2px solid transparent',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: theme.palette.primaryGreen[200],
            // @ts-expect-error type '300' can't be used to index type 'PaletteColor'
            border: `2px solid ${theme.palette.primary[300]}`,
          },
        }),
      },
    },
  },
})

export default theme
