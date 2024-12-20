import React from 'react'
import { TouchableOpacity } from 'react-native'
import { styled, Text, View } from 'tamagui'

interface SafeButtonProps {
  onPress: () => void
  label: string
}

export const StyledButtonWrapper = styled(View, {
  height: 48,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
})

export function SafeButton({ onPress, label }: SafeButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <StyledButtonWrapper backgroundColor="$primary">
        <Text fontSize="$4" fontWeight={600} color="$background">
          {label}
        </Text>
      </StyledButtonWrapper>
    </TouchableOpacity>
  )
}
