import React from 'react'
import { Theme, View } from 'tamagui'
import TxListItem from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import TxInfo from '@/src/components/TxInfo'
import { getOrderClass } from '@/src/hooks/useTransactionType'
import { isSwapTransferOrderTxInfo } from '@/src/utils/transaction-guards'
import { OrderTransactionInfo } from '@/src/store/gateway/types'
import { TransactionQueuedItem, TransactionItem } from '@/src/store/gateway/AUTO_GENERATED/transactions'

interface TxGroupedCard {
  transactions: (TransactionItem | TransactionQueuedItem)[]
  inQueue?: boolean
}

const orderClassTitles: Record<string, string> = {
  limit: 'Limit order settlement',
  twap: 'TWAP order settlement',
  liquidity: 'Liquidity order settlement',
  market: 'Swap order settlement',
}

const getSettlementOrderTitle = (order: OrderTransactionInfo): string => {
  const orderClass = getOrderClass(order)
  return orderClassTitles[orderClass] || orderClassTitles['market']
}

function TxGroupedCard({ transactions, inQueue }: TxGroupedCard) {
  const firstTxInfo = transactions[0].transaction.txInfo
  const isSwapTransfer = isSwapTransferOrderTxInfo(firstTxInfo)
  const label = isSwapTransfer ? getSettlementOrderTitle(firstTxInfo) : 'Bulk transactions'

  return (
    <TxListItem
      label={label}
      leftNode={
        <Theme name="logo">
          <View backgroundColor="$background" padding="$2" borderRadius={100}>
            <SafeFontIcon name="batch" />
          </View>
        </Theme>
      }
      rightNode={<SafeFontIcon name="external-link" color="$primaryLight" />}
    >
      <View width="100%">
        {transactions.map((item, index) => (
          <View width="100%" key={`${item.transaction.id}-${index}`} marginTop={12}>
            <TxInfo inQueue={inQueue} bordered tx={item.transaction} />
          </View>
        ))}
      </View>
    </TxListItem>
  )
}

export default React.memo(TxGroupedCard, (prevProps, nextProps) => {
  return prevProps.transactions.length === nextProps.transactions.length
})
