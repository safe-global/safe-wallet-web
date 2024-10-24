import { getTokenValue } from 'tamagui'
import type { Theme } from '@react-navigation/native/src/types'

export const NavDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: getTokenValue('$color.primaryMainDark'),
    background: getTokenValue('$color.backgroundMainDark'),
    card: getTokenValue('$color.backgroundMainDark'),
    text: getTokenValue('$color.textPrimaryDark'),
    border: getTokenValue('$color.backgroundMainDark'),
    notification: getTokenValue('$color.warningBackgroundDark'),
  },
}

export const NavLightTheme: Theme = {
  dark: false,
  colors: {
    primary: getTokenValue('$color.primaryMainLight'),
    background: getTokenValue('$color.backgroundMainLight'),
    card: getTokenValue('$color.backgroundMainLight'),
    text: getTokenValue('$color.textPrimaryLight'),
    border: getTokenValue('$color.backgroundMainLight'),
    notification: getTokenValue('$color.warningBackgroundLight'),
  },
}
