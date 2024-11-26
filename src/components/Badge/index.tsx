import React from 'react'
import { Circle, CircleProps, Text, TextProps, Theme, View } from 'tamagui'
import { badgeTheme } from '@/src/components/Badge/theme'

type BadgeThemeKeys = keyof typeof badgeTheme

type ExtractAfterUnderscore<T extends string> = T extends `${string}_${infer Rest}` ? Rest : never
type BadgeThemeTypes = ExtractAfterUnderscore<BadgeThemeKeys>

interface BadgeProps {
  content: string | React.ReactElement
  themeName?: BadgeThemeTypes
  circleSize?: string
  fontSize?: TextProps['fontSize']
  circleProps?: Partial<CircleProps>
  textContentProps?: Partial<TextProps>
  circular?: boolean
}

const Badge = ({
  content,
  circleSize = '$7',
  fontSize = 14,
  themeName = 'badge_warning',
  circular = true,
  circleProps,
  textContentProps,
}: BadgeProps) => {
  let contentToRender = content
  if (typeof content === 'string') {
    contentToRender = (
      <Text fontSize={fontSize} color={'$color'} {...textContentProps}>
        {content}
      </Text>
    )
  }

  if (circular) {
    return (
      <Theme name={themeName}>
        <Circle size={circleSize} backgroundColor={'$background'} {...circleProps}>
          {contentToRender}
        </Circle>
      </Theme>
    )
  }
  return (
    <Theme name={themeName}>
      <View
        alignSelf={'flex-start'}
        paddingVertical="$1"
        paddingHorizontal="$3"
        gap="$1"
        borderRadius={50}
        backgroundColor={'$background'}
        {...circleProps}
      >
        {contentToRender}
      </View>
    </Theme>
  )
}

export default Badge
