import React from 'react'
import { View } from 'tamagui'
import { SettingsMenu } from '@/src/features/Settings/components/Navbar/SettingsMenu'
import { SettingsButton } from '@/src/features/Settings/components/Navbar/SettingsButton'
import { BlurredIdenticonBackground } from '@/src/components/BlurredIdenticonBackground/BlurredIdenticonBackground'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Address } from '@/src/types/address'

export const Navbar = (props: { safeAddress: Address }) => {
  const { safeAddress } = props

  return (
    <View>
      <BlurredIdenticonBackground address={safeAddress} height={140}>
        <SafeAreaView style={styles.headerContainer}>
          <View flexDirection="row" alignItems="center" columnGap="$3">
            <SettingsButton />
            <SettingsMenu safeAddress={safeAddress} />
          </View>
        </SafeAreaView>
      </BlurredIdenticonBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 16,
    paddingBottom: 0,
  },
})
