import { useSelector } from 'react-redux'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { View } from 'tamagui'
import { BlurredIdenticonBackground } from '@/src/components/BlurredIdenticonBackground'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Identicon } from '@/src/components/Identicon'
import { shortenAddress } from '@/src/utils/formatters'
import { SafeFontIcon } from '@/src/components/SafeFontIcon'
import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import { Address } from '@/src/types/address'
import { Dropdown } from '@/src/components/Dropdown'
import { MyAccountsContainer, MyAccountsFooter } from '../MyAccounts'
import { SafesSliceItem, selectAllSafes } from '@/src/store/safesSlice'

const dropdownLabelProps = {
  fontSize: '$5',
  fontWeight: 600,
} as const

export const Navbar = () => {
  const activeSafe = useSelector(selectActiveSafe)
  const safes = useSelector(selectAllSafes)
  const memoizedSafes = useMemo(() => Object.values(safes), [safes])

  return (
    <View>
      <BlurredIdenticonBackground address={activeSafe.address as Address}>
        <SafeAreaView style={styles.headerContainer}>
          <Dropdown<SafesSliceItem>
            label={shortenAddress(activeSafe.address)}
            labelProps={dropdownLabelProps}
            dropdownTitle="My accounts"
            leftNode={<Identicon address={activeSafe.address} rounded={true} size={30} />}
            items={memoizedSafes}
            keyExtractor={({ item }) => item.SafeInfo.address.value}
            footerComponent={MyAccountsFooter}
            renderItem={MyAccountsContainer}
          />

          <TouchableOpacity>
            <SafeFontIcon name="apps" />
          </TouchableOpacity>
        </SafeAreaView>
      </BlurredIdenticonBackground>
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
