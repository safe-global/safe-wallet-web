import { createTheme } from '@mui/material'

declare module '@mui/material/styles' {
  // Custom color properties
  interface PaletteColor {
    background?: string
  }
  interface SimplePaletteColorOptions {
    background?: string
  }
  // Custom color palettes
  interface Palette {
    gray: Palette['primary']
    black: {
      300: string
      500: string
    }
  }
  interface PaletteOptions {
    gray: PaletteOptions['primary']
    black: {
      300: string
      500: string
    }
  }
}

const palette = {
  primary: {
    dark: '#0E7361',
    main: '#008C73',
    light: '#92C9BE',
    background: '#EFFAF8',
  },
  secondary: {
    main: '#162D45',
    light: '#566976',
  },
  gray: {
    main: '#B2BBC0',
    light: '#EEEFF0',
    background: '#F6F7F8',
  },
  error: {
    dark: '#C31717',
    main: '#F02525',
    light: '#FFCED6',
    background: '#FFF3F5',
  },
  success: {
    dark: '#027128',
    main: '#008C30',
    light: '#99CDAB',
  },
  info: {
    dark: '#247CB7',
    main: '#3BA2E7',
    light: '#A6D0EC',
    background: '#EBF7FF',
  },
  warning: {
    dark: '#E8663D',
    main: '#FFC05F',
    light: '#FBE5C5',
    background: '#FFF4E3',
  },
  // Will be adjusted further by design
  black: {
    300: '#ACBAC3',
    500: '#383E42',
  },
}

const theme = createTheme({
  palette,
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
      color: palette.secondary.main,
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
          borderColor: theme.palette.primary.main,
          textTransform: 'none',
          '&.Mui-disabled': {
            color: '#fff',
            backgroundColor: theme.palette.gray.main,
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
          border: `2px solid ${theme.palette.gray.light}`,
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
            borderBottom: `2px solid ${theme.palette.gray.light}`,
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
        }),
      },
    },
  },
})

export default theme
