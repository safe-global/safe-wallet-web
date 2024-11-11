import React from 'react'
import { Circle, Text, TextProps, Theme } from 'tamagui'
import { AlertType } from '@/src/components/Alert'

interface CircularBadgeProps {
  content: string
  themeName?: AlertType
  circleSize?: string
  fontSize?: TextProps['fontSize']
}

const CircularBadge = ({ content, circleSize = '$7', fontSize = 14, themeName = 'warning' }: CircularBadgeProps) => {
  return (
    <Theme name={themeName}>
      <Circle size={circleSize} backgroundColor={'$color'}>
        <Text fontSize={fontSize} color={'$badgeTextColor'}>
          {content}
        </Text>
      </Circle>
    </Theme>
  )
}

export default CircularBadge
