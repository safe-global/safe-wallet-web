import React, { useEffect } from 'react'
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated'
import { useTheme } from 'tamagui'

interface CarouselFeedbackProps {
  isActive: boolean
}

const UNACTIVE_WIDTH = 4
const ACTIVE_WIDTH = 14

export function CarouselFeedback({ isActive }: CarouselFeedbackProps) {
  const width = useSharedValue(UNACTIVE_WIDTH)
  const theme = useTheme()

  useEffect(() => {
    if (isActive) {
      width.value = withSpring(ACTIVE_WIDTH)
    } else {
      width.value = withSpring(UNACTIVE_WIDTH)
    }
  }, [isActive])

  return (
    <Animated.View
      testID="carousel-feedback"
      style={{
        borderRadius: 50,
        backgroundColor: isActive ? theme.color.get() : theme.colorSecondary.get(),
        height: UNACTIVE_WIDTH,
        width,
      }}
    />
  )
}
