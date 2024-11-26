import React from 'react'
import { View as RCView, StyleSheet } from 'react-native'
import { View } from 'tamagui'
import { BottomSheetBackgroundProps, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { BlurView } from '@react-native-community/blur'

const BackgroundComponent = React.memo(({ style }: BottomSheetBackgroundProps) => {
  return (
    <RCView style={style}>
      <View flex={1} backgroundColor="$backgroundPaper" borderRadius={'$6'}></View>
    </RCView>
  )
})

const BackdropComponent = React.memo(() => {
  const { dismiss } = useBottomSheetModal()

  const handleClose = () => dismiss()

  return (
    <View
      testID="dropdown-backdrop"
      onPress={handleClose}
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
    >
      <BlurView style={styles.absolute} blurType="dark" blurAmount={8} />
    </View>
  )
})

BackgroundComponent.displayName = 'BackgroundComponent'
BackdropComponent.displayName = 'BackdropComponent'

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
})

export { BackgroundComponent, BackdropComponent }
