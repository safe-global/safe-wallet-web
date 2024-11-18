import SafeListItem from '@/src/components/SafeListItem'
import { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import React, { useCallback } from 'react'
import { SectionList, SectionListRenderItem, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Spinner, View } from 'tamagui'
import TxInfo from '@/src/components/TxInfo'
import { getBulkGroupTxHash, getTxHash } from '@/src/utils/transaction-guards'
import { GroupedTxsWithTitle } from '../TxHistory/utils'
import TxConflictingCard from '@/src/components/transactions-list/Card/TxConflictingCard'
import TxGroupedCard from '@/src/components/transactions-list/Card/TxGroupedCard'
import CircularBadge from '@/src/components/CircularBadge'
import { NavBarTitle } from '@/src/components/Title/NavBarTitle'
import { LargeHeaderTitle } from '@/src/components/Title/LargeHeaderTitle'
import { useScrollableHeader } from '@/src/navigation/useScrollableHeader'

interface PendingTxListProps {
  transactions: GroupedTxsWithTitle[]
  onEndReached: (info: { distanceFromEnd: number }) => void
  isLoading?: boolean
  amount: number
  hasMore: boolean
}

function PendingTxList({ transactions, onEndReached, isLoading, hasMore, amount }: PendingTxListProps) {
  const { handleScroll } = useScrollableHeader({
    children: (
      <>
        <NavBarTitle paddingRight={5}>Pending Transactions</NavBarTitle>
        <CircularBadge content={`${amount}${hasMore ? '+' : ''}`} circleSize={'$6'} fontSize={10} />
      </>
    ),
  })

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

  const LargeHeader = (
    <View flexDirection={'row'} alignItems={'center'} paddingTop={'$3'} paddingHorizontal={'$3'}>
      {' '}
      <LargeHeaderTitle marginRight={5}>Pending Transactions</LargeHeaderTitle>
      {isLoading ? (
        <Spinner size="large" color="$warning1ContrastTextDark" />
      ) : (
        <CircularBadge content={`${amount}${hasMore ? '+' : ''}`} />
      )}
    </View>
  )

  return (
    <SectionList
      testID={'tx-history-list'}
      ListHeaderComponent={LargeHeader}
      sections={transactions}
      contentInsetAdjustmentBehavior="automatic"
      keyExtractor={(item, index) =>
        Array.isArray(item) ? (getBulkGroupTxHash(item) || getTxHash(item[0])) + index : getTxHash(item) + index
      }
      renderItem={renderItem}
      onEndReached={onEndReached}
      ListFooterComponent={isLoading ? <Spinner size={'small'} color={'$color'} /> : undefined}
      renderSectionHeader={({ section: { title } }) => <SafeListItem.Header title={title} />}
      onScroll={(handleScroll}
      scrollEventThrottle={16}
    />
  )
}

export default PendingTxList
