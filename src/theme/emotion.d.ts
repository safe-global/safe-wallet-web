import '@emotion/react'
import { MD3Theme } from 'react-native-paper'

declare module '@emotion/react' {
  export interface Theme extends MD3Theme {}
}
