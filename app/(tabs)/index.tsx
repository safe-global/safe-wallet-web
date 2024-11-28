import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Image, Text, View } from 'tamagui'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { shortenAddress } from '@/src/utils/formatters'
import { InnerShadow } from '@/src/components/InnerShadow'
import { AssetsContainer } from '@/src/features/Assets'

// TODO: take it from safe wallet slice info
const fakeAccountUri = 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80'

export const LayoutHeader = () => {
  const activeSafe = useSelector(selectActiveSafe)

  return (
    <View minHeight={140}>
      <Image source={{ uri: fakeAccountUri }} style={[styles.image, StyleSheet.absoluteFill]} blurRadius={5} />

      <InnerShadow />

      <SafeAreaView style={styles.headerContainer}>
        <View flexDirection="row" alignItems="center" columnGap="$3">
          <Avatar circular size="$10">
            <Avatar.Image accessibilityLabel="Nate Wienert" src={fakeAccountUri} />
            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
          </Avatar>

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

const HomeScreen = () => {
  return <AssetsContainer />
}

export default HomeScreen

export const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
})
