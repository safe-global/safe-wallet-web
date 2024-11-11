import React from 'react'
import { Theme, View } from 'tamagui'
import TxInfo from '@/src/components/TxInfo'
import { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import { Alert } from '@/src/components/Alert'

interface TxConflictingCard {
  transactions: Transaction[]
  inQueue?: boolean
}

function TxConflictingCard({ transactions, inQueue }: TxConflictingCard) {
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

export default React.memo(TxConflictingCard, (prevProps, nextProps) => {
  return prevProps.transactions.length === nextProps.transactions.length
})
