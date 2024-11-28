import { blo } from 'blo'
import { View } from 'tamagui'
import { Image } from 'expo-image'
import { Dimensions, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Address } from '@/src/types/address'

type Props = {
  address: Address
  height?: number
}
export const BlurredIdenticonBackground = ({ address, height = 125 }: Props) => {
  const blockie = blo(address)
  return (
    <View style={styles.container}>
      <View style={[styles.containerInner, { height: height }]}>
        <View
          style={[
            styles.containerInnerBackground,
            {
              height: height,
            },
          ]}
        ></View>
        <Image testID={'header-image'} source={{ uri: blockie }} style={styles.identicon} />

        <BlurView
          intensity={100}
          style={[
            styles.blurView,
            {
              height: height,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  containerInner: {
    position: 'relative',
    left: 0,
    right: 0,
  },
  containerInnerBackground: {
    backgroundColor: '#000',
  },
  identicon: {
    bottom: 20,
    opacity: 0.7,
    position: 'absolute',
    borderRadius: '50%',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  blurView: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
})
