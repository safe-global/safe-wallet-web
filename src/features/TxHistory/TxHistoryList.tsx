import TxInfo from '@/src/components/TxInfo'
import { Transaction, TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'
import React, { useCallback, useMemo } from 'react'
import { SectionList, SectionListRenderItem } from 'react-native'
import { Spinner, View } from 'tamagui'
import { GroupedTxsWithTitle, groupTxs } from './utils'
import TxGroupedCard from '@/src/components/transactions-list/Card/TxGroupedCard'
import SafeListItem from '@/src/components/SafeListItem'

interface TxHistoryList {
  transactions?: TransactionListItem[]
  onEndReached: (info: { distanceFromEnd: number }) => void
  isLoading?: boolean
}

const getTxHash = (item: Transaction): string => item.transaction.txHash as unknown as string

function TxHistoryList({ transactions, onEndReached, isLoading }: TxHistoryList) {
  const groupedList = useMemo(() => groupTxs(transactions || []), [transactions])
  const renderItem = useCallback<SectionListRenderItem<Transaction | Transaction[], GroupedTxsWithTitle>>(
    ({ item, index }) => (
      <View marginTop={index && '$4'} paddingHorizontal="$3">
        {Array.isArray(item) ? <TxGroupedCard transactions={item} /> : <TxInfo tx={item.transaction} />}
      </View>
    ),
    [],
  )

  return (
    <SectionList
      testID={'tx-history-list'}
      sections={groupedList}
      keyExtractor={(item, index) => (Array.isArray(item) ? getTxHash(item[0]) + index : getTxHash(item) + index)}
      renderItem={renderItem}
      onEndReached={onEndReached}
      ListFooterComponent={isLoading ? <Spinner size={'small'} color={'$color'} /> : undefined}
      renderSectionHeader={({ section: { title } }) => <SafeListItem.Header title={title} />}
    />
  )
}

export default TxHistoryList
