import { createTheme, Shadows } from '@mui/material'
import palette from './colors'
import darkPalette from './colors-dark'
import { base } from './spacings'

declare module '@mui/material/styles' {
  // Custom color palettes
  interface Palette {
    border: Palette['primary']
  }
  interface PaletteOptions {
    border: PaletteOptions['primary']
  }

  interface TypeBackground {
    main: string
    light: string
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

export const theme = createTheme()

const initTheme = (darkMode: boolean) => {
  const colors = darkMode ? darkPalette : palette
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...colors,
    },
    spacing: base,
    shadows: [
      'none',
      '0 1px 4px #162d450a, 0 4px 10px #162d4514',
      '0 1px 4px #162d450a, 0 4px 10px #162d4514',
      '0 2px 20px #162d450a, 0 8px 32px #162d4514',
      '0 8px 32px #162d450f, 0 24px 60px #162d451f',
      ...Array(20).fill('none'),
    ] as Shadows,
    typography: {
      fontFamily: 'Averta, sans-serif',
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
            transition: 'background 0.2s, border 0.2s',
            borderRadius: '8px',
            border: `2px solid ${theme.palette.border.light}`,
            overflow: 'hidden',

            '&::before': {
              content: 'none',
            },

            '&:hover': {
              borderColor: theme.palette.primary.light,
            },

            '&:hover > .MuiAccordionSummary-root': {
              background: theme.palette.primary.background,
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.spacing(1),
            boxSizing: 'border-box',
            border: '2px solid transparent',
          }),
        },
      },
      MuiDialog: {
        defaultProps: {
          fullWidth: true,
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(3),
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
            borderRadius: '8px !important',
            backgroundImage: 'none',
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
      MuiAlert: {
        styleOverrides: {
          standardError: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.error.main,
            },
          }),
          standardInfo: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.info.main,
            },
          }),
          standardSuccess: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.success.main,
            },
          }),
          standardWarning: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main,
            },
          }),
          root: ({ theme }) => ({
            color: theme.palette.secondary.main,
            padding: '12px 16px',
            backgroundColor: 'white',
          }),
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
      MuiTableBody: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-root': {
              borderBottom: `1px solid ${theme.palette.border.light}`,
            },
          }),
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.main,
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: ({ theme }) => ({
            borderColor: theme.palette.border.main,
          }),
          root: ({ theme }) => ({
            borderColor: theme.palette.border.main,
          }),
        },
      },
    },
  })
}

export default initTheme
