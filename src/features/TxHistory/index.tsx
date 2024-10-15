import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { addTx, txHistorySelector } from '@/src/store/txHistorySlice'
import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { TransactionItem } from 'safe-client-gateway-sdk'

function TxHistory() {
  const txHistory = useAppSelector(txHistorySelector)
  const dispatch = useAppDispatch()

  // TODO: will be removed in the next PR
  // it is just for easy test purposes
  console.log(txHistory)

  const createTx = () => {
    dispatch(
      addTx({
        item: {} as TransactionItem,
      }),
    )
  }

  return (
    <View>
      <Text onPress={createTx} variant="titleLarge">
        CLick for creating a tx
      </Text>
    </View>
  )
}

export default TxHistory
