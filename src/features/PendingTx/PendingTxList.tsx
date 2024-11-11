import SafeListItem from '@/src/components/SafeListItem'
import { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import React, { useCallback } from 'react'
import { SectionList, SectionListRenderItem } from 'react-native'
import { Spinner, View } from 'tamagui'
import TxInfo from '@/src/components/TxInfo'
import { getBulkGroupTxHash, getTxHash } from '@/src/utils/transaction-guards'
import { GroupedTxsWithTitle } from '../TxHistory/utils'
import TxConflictingCard from '@/src/components/transactions-list/Card/TxConflictingCard'
import TxGroupedCard from '@/src/components/transactions-list/Card/TxGroupedCard'

interface PendingTxListProps {
  transactions: GroupedTxsWithTitle[]
  onEndReached: (info: { distanceFromEnd: number }) => void
  isLoading?: boolean
}

function PendingTxList({ transactions, onEndReached, isLoading }: PendingTxListProps) {
  const renderItem = useCallback<SectionListRenderItem<Transaction | Transaction[], GroupedTxsWithTitle>>(
    ({ item, index }) => {
      return (
        <View marginTop={index && '$4'} paddingHorizontal="$3">
          {Array.isArray(item) ? (
            getBulkGroupTxHash(item) ? (
              <TxGroupedCard transactions={item} inQueue />
            ) : (
              <TxConflictingCard inQueue transactions={item} />
            )
          ) : (
            <TxInfo inQueue tx={item?.transaction} />
          )}
        </View>
      )
    },
    [],
  )

  return (
    <SectionList
      testID={'tx-history-list'}
      sections={transactions}
      keyExtractor={(item, index) =>
        Array.isArray(item) ? (getBulkGroupTxHash(item) || getTxHash(item[0])) + index : getTxHash(item) + index
      }
      renderItem={renderItem}
      onEndReached={onEndReached}
      ListFooterComponent={isLoading ? <Spinner size={'small'} color={'$color'} /> : undefined}
      renderSectionHeader={({ section: { title } }) => <SafeListItem.Header title={title} />}
    />
  )
}

export default PendingTxList
