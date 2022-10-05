import { alpha, createTheme } from '@mui/material/styles'
import type { Shadows } from '@mui/material/styles'
import type {} from '@mui/x-date-pickers/themeAugmentation'

import palette from './colors'
import darkPalette from './colors-dark'
import { base } from './spacings'

declare module '@mui/material/styles' {
  // Custom color palettes
  interface Palette {
    border: Palette['primary']
    logo: Palette['primary']
    static: Palette['primary']
  }
  interface PaletteOptions {
    border: PaletteOptions['primary']
    logo: PaletteOptions['primary']
    static: PaletteOptions['primary']
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

const initTheme = (darkMode: boolean) => {
  const colors = darkMode ? darkPalette : palette
  const shadowColor = colors.primary.light

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...colors,
    },
    spacing: base,
    shadows: [
      'none',
      darkMode ? `0 0 2px ${shadowColor}` : `0 1px 4px ${shadowColor}0a, 0 4px 10px ${shadowColor}14`,
      darkMode ? `0 0 2px ${shadowColor}` : `0 1px 4px ${shadowColor}0a, 0 4px 10px ${shadowColor}14`,
      darkMode ? `0 0 2px ${shadowColor}` : `0 2px 20px ${shadowColor}0a, 0 8px 32px ${shadowColor}14`,
      darkMode ? `0 0 2px ${shadowColor}` : `0 8px 32px ${shadowColor}0a, 0 24px 60px ${shadowColor}14`,
      ...Array(20).fill('none'),
    ] as Shadows,
    typography: {
      fontFamily: 'DM Sans, sans-serif',
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
        letterSpacing: '0.4px',
      },
      overline: {
        fontSize: '11px',
        lineHeight: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            ...theme.typography.body1,
            color: theme.palette.primary.light,
          }),
        },
      },
      MuiButton: {
        variants: [
          {
            props: { size: 'stretched' },
            style: {
              padding: '12px 48px',
            },
          },
          {
            props: { variant: 'danger' },
            style: ({ theme }) => ({
              backgroundColor: theme.palette.error.background,
              color: theme.palette.error.main,
              '&:hover': {
                color: theme.palette.error.dark,
                backgroundColor: theme.palette.error.light,
              },
            }),
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
            '&:hover': {
              boxShadow: 'none',
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
            transition: 'background 0.2s, border 0.2s',
            borderRadius: '8px',
            border: `1px solid ${theme.palette.border.light}`,
            overflow: 'hidden',

            '&::before': {
              content: 'none',
            },

            '&:hover': {
              borderColor: theme.palette.secondary.light,
            },

            '&:hover > .MuiAccordionSummary-root': {
              background: theme.palette.background.light,
            },

            '&.Mui-expanded': {
              margin: 0,
              borderColor: theme.palette.secondary.light,
            },

            '&.Mui-expanded > .MuiAccordionSummary-root': {
              background: theme.palette.background.light,
            },
          }),
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(2),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.spacing(1),
            boxSizing: 'border-box',
            border: '2px solid transparent',
            boxShadow: 'none',
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
        defaultProps: {
          elevation: 0,
        },
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
      MuiPopover: {
        defaultProps: {
          elevation: 2,
        },
        styleOverrides: {
          paper: {
            overflow: 'visible',
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
            '&. MuiPaper-root': {
              backgroundColor: theme.palette.error.background,
            },
            border: `1px solid ${theme.palette.error.main}`,
          }),
          standardInfo: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.info.main,
            },
            '&. MuiPaper-root': {
              backgroundColor: theme.palette.info.background,
            },
            border: `1px solid ${theme.palette.info.main}`,
          }),
          standardSuccess: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.success.main,
            },
            '&. MuiPaper-root': {
              backgroundColor: theme.palette.success.background,
            },
            border: `1px solid ${theme.palette.success.main}`,
          }),
          standardWarning: ({ theme }) => ({
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main,
            },
            '&. MuiPaper-root': {
              backgroundColor: theme.palette.warning.background,
            },
            border: `1px solid ${theme.palette.warning.main}`,
          }),
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
            padding: '12px 16px',
          }),
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-root': {
              borderBottom: `2px solid ${theme.palette.border.light}`,
            },

            [theme.breakpoints.down('sm')]: {
              '& .MuiTableCell-root:first-child': {
                paddingRight: theme.spacing(1),
              },

              '& .MuiTableCell-root:not(:first-child):not(:last-child)': {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
              },

              '& .MuiTableCell-root:last-child': {
                paddingLeft: theme.spacing(1),
              },
            },
          }),
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-root': {
              paddingTop: theme.spacing(1),
              paddingBottom: theme.spacing(1),
              borderBottom: 'none',
            },

            [theme.breakpoints.down('sm')]: {
              '& .MuiTableCell-root:first-child': {
                paddingRight: theme.spacing(1),
              },

              '& .MuiTableCell-root:not(:first-child):not(:last-child)': {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
              },

              '& .MuiTableCell-root:last-child': {
                paddingLeft: theme.spacing(1),
              },
            },

            '& .MuiTableRow-root': {
              transition: 'background-color 0.2s',
              '&:not(:last-child)': {
                borderBottom: `1px solid ${theme.palette.border.light}`,
              },
            },

            '& .MuiTableRow-root:hover': {
              backgroundColor: theme.palette.background.light,
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
      MuiSvgIcon: {
        styleOverrides: {
          fontSizeSmall: {
            width: '1rem',
            height: '1rem',
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 4,
            backgroundColor: theme.palette.background.main,
            border: '1px solid transparent',
            transition: 'border-color 0.2s',

            '&:hover, &:focus, &.Mui-focused': {
              backgroundColor: theme.palette.background.main,
              borderColor: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiSelect: {
        defaultProps: {
          MenuProps: {
            sx: {
              '& .MuiPaper-root': {
                overflow: 'auto',
              },
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.body2,
            color: darkMode ? darkPalette.background.main : palette.text.primary,
            backgroundColor: darkMode ? darkPalette.text.primary : palette.background.main,
          }),
          arrow: {
            color: darkMode ? darkPalette.text.primary : palette.background.main,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: ({ theme }) => ({
            backdropFilter: 'blur(1px)',
            backgroundColor: alpha(theme.palette.background.main, 0.75),
          }),
        },
      },
      MuiSwitch: {
        styleOverrides: {
          thumb: ({ theme }) => ({
            boxShadow:
              '0px 2px 6px -1px rgba(0, 0, 0, 0.2), 0px 1px 4px rgba(0, 0, 0, 0.14), 0px 1px 4px rgba(0, 0, 0, 0.14)',
          }),
        },
      },
    },
  })
}

export default initTheme
