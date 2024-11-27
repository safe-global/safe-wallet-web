import { SafeListItem } from '@/src/components/SafeListItem'
import React from 'react'
import { SectionList } from 'react-native'
import { Spinner, View } from 'tamagui'
import { Badge } from '../../components/Badge'
import { NavBarTitle } from '@/src/components/Title/NavBarTitle'
import { LargeHeaderTitle } from '@/src/components/Title/LargeHeaderTitle'
import { useScrollableHeader } from '@/src/navigation/useScrollableHeader'
import { TransactionQueuedItem } from '@/src/store/gateway/AUTO_GENERATED/transactions'
import { PendingTransactionItems } from '@/src/store/gateway/types'
import { keyExtractor, renderItem } from '@/src/features/PendingTx/utils'

export interface GroupedPendingTxsWithTitle {
  title: string
  data: (PendingTransactionItems | TransactionQueuedItem[])[]
}

interface PendingTxListProps {
  transactions: GroupedPendingTxsWithTitle[]
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
        <Badge content={`${amount}${hasMore ? '+' : ''}`} circleSize={'$6'} fontSize={10} />
      </>
    ),
  })

  const LargeHeader = (
    <View flexDirection={'row'} alignItems={'center'} paddingTop={'$3'} paddingHorizontal={'$3'}>
      {' '}
      <LargeHeaderTitle marginRight={5}>Pending Transactions</LargeHeaderTitle>
      {isLoading ? (
        <Spinner size="large" color="$warning1ContrastTextDark" />
      ) : (
        <Badge content={`${amount}${hasMore ? '+' : ''}`} />
      )}
    </View>
  )

  return (
    <SectionList
      testID={'tx-history-list'}
      ListHeaderComponent={LargeHeader}
      sections={transactions}
      contentInsetAdjustmentBehavior="automatic"
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onEndReached}
      ListFooterComponent={isLoading ? <Spinner size={'small'} color={'$color'} /> : undefined}
      renderSectionHeader={({ section: { title } }) => <SafeListItem.Header title={title} />}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    />
  )
}

export default PendingTxList
