import React from 'react'
import { Image, styled } from 'tamagui'
import SafeWalletLogo from '@/assets/images/safe-wallet.png'
import { SafeAreaView } from 'react-native'

export const StyledSafeAreaView = styled(SafeAreaView, {
  alignItems: 'center',
})

export function OnboardingHeader() {
  return (
    <StyledSafeAreaView>
      <Image accessibilityLabel="Safe Wallet" source={SafeWalletLogo} />
    </StyledSafeAreaView>
  )
}
