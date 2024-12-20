import React from 'react'
import { Theme, View } from 'tamagui'
import { TxInfo } from '@/src/components/TxInfo'
import { Alert } from '@/src/components/Alert'
import { TransactionQueuedItem } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

interface TxConflictingCard {
  transactions: TransactionQueuedItem[]
  inQueue?: boolean
}

function TxConflictingComponent({ transactions, inQueue }: TxConflictingCard) {
  return (
    <>
      <View marginTop={12}>
        <Alert type="warning" message="Conflicting transactions" />
      </View>

      <Theme name="warning">
        {transactions.map((item, index) => (
          <View backgroundColor="$background" width="100%" key={`${item.transaction.id}-${index}`} marginTop={12}>
            <TxInfo inQueue={inQueue} tx={item.transaction} bordered />
          </View>
        ))}
      </Theme>
    </>
  )
}

export const TxConflictingCard = React.memo(TxConflictingComponent, (prevProps, nextProps) => {
  return prevProps.transactions.length === nextProps.transactions.length
})
