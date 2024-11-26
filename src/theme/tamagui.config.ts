import { radius, zIndex } from '@tamagui/themes'
import { createTamagui, createTokens } from 'tamagui'
import { createDmSansFont } from '@tamagui/font-dm-sans'
import { flattenPalette } from '@/src/theme/helpers/utils'
import lightPalette from '@/src/theme/palettes/lightPalette'
import darkPalette from '@/src/theme/palettes/darkPalette'

const colors = {
  ...flattenPalette(lightPalette, { suffix: 'Light' }),
  ...flattenPalette(darkPalette, { suffix: 'Dark' }),
}
export const tokens = createTokens({
  color: colors,
  space: {
    $1: 4,
    $2: 8,
    true: 8,
    $3: 12,
    $4: 16,
    $5: 20,
    $6: 24,
    $7: 28,
    $8: 32,
    $9: 36,
    $10: 40,
  },
  // space,
  size: {
    $1: 4,
    $2: 8,
    true: 8,
    $3: 12,
    $4: 16,
    $5: 20,
    $6: 24,
    $7: 28,
    $8: 32,
    $9: 36,
    $10: 40,
  },
  zIndex,
  radius,
})

const DmSansFont = createDmSansFont({
  face: {
    500: { normal: 'DMSans-Medium', italic: 'DMSans-MediumItalic' },
    600: { normal: 'DMSans-SemiBold', italic: 'DMSans-SemiBoldItalic' },
    700: { normal: 'DMSans-Bold', italic: 'DMSans-BoldItalic' },
  },
})
export const config = createTamagui({
  fonts: {
    body: DmSansFont,
    heading: DmSansFont,
  },
  themes: {
    light: {
      background: tokens.color.backgroundMainLight,
      backgroundPaper: tokens.color.backgroundPaperLight,
      backgroundHover: tokens.color.backgroundLightLight,
      backgroundPress: tokens.color.primaryLightLight,
      backgroundFocus: tokens.color.backgroundMainLight,
      backgroundStrong: tokens.color.primaryDarkLight,
      backgroundTransparent: 'transparent',
      color: tokens.color.textPrimaryLight,
      primary: tokens.color.primaryMainLight,
      colorSecondary: tokens.color.primaryLightLight,
      colorHover: tokens.color.textSecondaryLight,
      borderLight: tokens.color.borderLightLight,
      error: tokens.color.errorMainLight,
      errorDark: tokens.color.errorDarkDark,
    },
    light_label: {
      color: tokens.color.textSecondaryLight,
    },
    dark_label: {
      color: tokens.color.textSecondaryDark,
    },
    light_info: {
      background: tokens.color.infoBackgroundLight,
      color: tokens.color.infoMainLight,
    },
    dark_info: {
      background: tokens.color.infoBackgroundDark,
      color: tokens.color.infoMainDark,
    },
    light_success: {
      background: tokens.color.successBackgroundLight,
      color: tokens.color.successMainLight,
      badgeBackground: tokens.color.successDarkLight,
    },
    dark_success: {
      background: tokens.color.successBackgroundDark,
      color: tokens.color.successMainDark,
      badgeBackground: tokens.color.successDarkDark,
    },
    light_warning: {
      background: tokens.color.warning1MainLight,
      color: tokens.color.warning1ContrastTextLight,
      badgeTextColor: tokens.color.warning1MainLight,
      badgeBackground: tokens.color.warningBackgroundLight,
    },
    dark_warning: {
      background: tokens.color.warning1MainDark,
      color: tokens.color.warning1ContrastTextDark,
      badgeBackground: tokens.color.warningDarkDark,
      badgeTextColor: tokens.color.backgroundDefaultDark,
    },
    light_error: {
      background: tokens.color.error1MainLight,
      color: tokens.color.error1ContrastTextLight,
    },
    dark_error: {
      background: tokens.color.error1MainDark,
      color: tokens.color.error1ContrastTextDark,
    },
    light_logo: {
      background: tokens.color.logoBackgroundLight,
    },
    dark_logo: {
      background: tokens.color.logoBackgroundDark,
    },
    light_container: {
      background: tokens.color.backgroundPaperLight,
    },
    light_safe_list: {
      background: tokens.color.backgroundDefaultLight,
    },
    dark_safe_list: {
      background: tokens.color.backgroundDefaultDark,
    },
    dark: {
      background: tokens.color.backgroundDefaultDark,
      backgroundPaper: tokens.color.backgroundPaperDark,
      backgroundHover: tokens.color.backgroundLightDark,
      backgroundPress: tokens.color.primaryLightDark,
      backgroundFocus: tokens.color.backgroundMainDark,
      backgroundStrong: tokens.color.primaryDarkDark,
      backgroundTransparent: 'transparent',
      color: tokens.color.textPrimaryDark,
      primary: tokens.color.primaryMainDark,
      colorSecondary: tokens.color.primaryLightDark,
      borderLight: tokens.color.borderLightDark,
      error: tokens.color.errorMainDark,
      errorDark: tokens.color.errorDarkDark,
    },
  },
  tokens,
})

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {
    tokens: typeof tokens
  }
}

export default config
