import { createTheme } from '@mui/material'
import palette from './colors'
import { base } from './spacings'

declare module '@mui/material/styles' {
  // Custom color palettes
  interface Palette {
    border: Palette['primary']
  }
  interface PaletteOptions {
    border: PaletteOptions['primary']
  }

  // Custom color properties
  interface PaletteColor {
    background?: string
  }
  interface SimplePaletteColorOptions {
    background?: string
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    // SvgIconPropsColorOverrides['primary'] doesn't work
    border: unknown
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    stretched: true
  }
}

const theme = createTheme({
  palette,
  spacing: base,
  typography: {
    fontFamily: 'Averta, sans-serif',

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
      lineHeight: '20px',
    },
    caption: {
      fontSize: '12px',
      lineHeight: '16px',
    },
    overline: {
      fontSize: '11px',
      lineHeight: '14px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { size: 'stretched' },
          style: {
            padding: '12px 48px',
          },
        },
      ],
      styleOverrides: {
        sizeSmall: {
          fontSize: '14px',
          padding: '8px 24px',
        },
        sizeMedium: {
          fontSize: '16px',
          padding: '12px 24px',
        },
        root: ({ theme }) => ({
          borderRadius: '8px',
          fontWeight: 'bold',
          lineHeight: 1.25,
          borderColor: theme.palette.primary.main,
          textTransform: 'none',
          '&.Mui-disabled': {
            color: '#fff',
            backgroundColor: theme.palette.border.main,
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
          transition: 'background 0.2s',
          borderRadius: '8px',
          border: `2px solid ${theme.palette.border.light}`,
          '&::before': {
            content: 'none',
          },

          '&:hover .MuiAccordionSummary-root': {
            background: theme.palette.primary.background,
          },

          '&:last-of-type': {
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
          },
        }),
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
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.border.light,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          borderWidth: 2,
          borderColor: theme.palette.border.light,
        }),
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        sizeSmall: {
          padding: '4px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-root': {
            borderBottom: `2px solid ${theme.palette.border.light}`,
          },
        }),
      },
    },
  },
})

export default theme
