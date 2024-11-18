import PendingTx from '@/src/features/PendingTx'
import React from 'react'
import { View } from 'tamagui'

function PendingScreen() {
  return (
    <View paddingHorizontal={'$3'}>
      <PendingTx />
    </View>
  )
}

export default PendingScreen
