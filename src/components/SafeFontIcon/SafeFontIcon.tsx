import React from 'react'
import createIconSetFromIcoMoon from '@expo/vector-icons/createIconSetFromIcoMoon'
import { useFonts } from 'expo-font'
import { IconName } from '@/src/types/iconTypes'

export const SafeIcon = createIconSetFromIcoMoon(
  require('@/assets/fonts/safe-icons/selection.json'),
  'SafeIcons',
  'safe-icons.ttf',
)

export interface IconProps {
  name: IconName
  size?: number
  color?: string
}

export const SafeFontIcon = ({ name, size = 24, color, ...rest }: IconProps) => {
  const [fontsLoaded] = useFonts({
    SafeIcons: require('@/assets/fonts/safe-icons/safe-icons.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return <SafeIcon name={name} size={size} color={color} {...rest} />
}
