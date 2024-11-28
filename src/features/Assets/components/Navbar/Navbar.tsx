import { useSelector } from 'react-redux'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { Text, View } from 'tamagui'
import { BlurredIdenticonBackground } from '@/src/components/BlurredIdenticonBackground'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Identicon } from '@/src/components/Identicon'
import { shortenAddress } from '@/src/utils/formatters'
import { SafeFontIcon } from '@/src/components/SafeFontIcon'
import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Address } from '@/src/types/address'

export const Navbar = () => {
  const activeSafe = useSelector(selectActiveSafe)
  return (
    <View>
      <BlurredIdenticonBackground address={activeSafe.address as Address} />

      <SafeAreaView style={styles.headerContainer}>
        <View flexDirection="row" alignItems="center" columnGap="$3">
          <Identicon address={activeSafe.address} rounded={true} size={30} />

          <View justifyContent="center" alignItems="center" flexDirection="row">
            <Text fontSize="$5" fontWeight={600}>
              {shortenAddress(activeSafe.address)}
            </Text>
            <SafeFontIcon name="arrow-down" />
          </View>
        </View>

        <TouchableOpacity>
          <SafeFontIcon name="apps" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 16,
    paddingBottom: 0,
  },
})
