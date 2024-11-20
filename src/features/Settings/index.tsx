import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveSafe } from '../../store/activeSafeSlice' // You'll need to create this action
import { selectActiveChain } from '@/src/store/activeChainSlice'
import { View, Text, Input } from 'tamagui'
import { TouchableOpacity } from 'react-native'

export const SafeAddressInput = () => {
  const dispatch = useDispatch()
  const activeChain = useSelector(selectActiveChain)
  const [safeAddress, setSafeAddress] = useState('')

  const handleSubmit = () => {
    dispatch(
      setActiveSafe({
        chainId: activeChain.chainId,
        address: safeAddress,
      }),
    )
  }

  return (
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
  )
}
