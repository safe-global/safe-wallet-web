import { View, Text, Input } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveChain } from '@/src/store/activeChainSlice'
import { setActiveSafe } from '@/src/store/activeSafeSlice'
import { Address } from '@/src/types/address'

export const AppSettings = () => {
  const dispatch = useDispatch()
  const activeChain = useSelector(selectActiveChain)
  const [safeAddress, setSafeAddress] = useState('')

  const handleSubmit = () => {
    dispatch(
      setActiveSafe({
        chainId: activeChain.chainId,
        address: safeAddress as Address,
      }),
    )
  }
  return (
    <View paddingHorizontal={'$3'}>
      <View padding="$3">
        <Input
          value={safeAddress}
          onChangeText={setSafeAddress}
          placeholder="Enter Safe Address"
          placeholderTextColor="#666"
          fontSize={20}
          height={30}
          marginVertical={10}
        />
        <TouchableOpacity onPress={handleSubmit}>
          <Text>Set Safe Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
