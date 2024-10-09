import TxName from '@/src/components/TxName'
import { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'
import React from 'react'
import { FlatList } from 'react-native'
import { Spinner } from 'tamagui'

interface TxHistoryList {
  transactions?: TransactionListItem[]
  onEndReached: (info: { distanceFromEnd: number }) => void
  isLoading?: boolean
}

function TxHistoryList({ transactions, onEndReached, isLoading }: TxHistoryList) {
  return (
    <FlatList
      style={{ paddingHorizontal: 20 }}
      data={transactions?.filter((item) => 'transaction' in item)}
      renderItem={({ item }) => <TxName tx={item.transaction} />}
      onEndReached={onEndReached}
      ListFooterComponent={isLoading ? <Spinner size={'small'} color={'$color'} /> : undefined}
    />
  )
}

export default TxHistoryList
