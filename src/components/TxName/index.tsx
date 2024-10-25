import React from 'react'
import { Text } from 'tamagui'
import { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'

import { useTransactionType } from '@/src/hooks/useTransactionType'
import { formatDateTime } from '@/src/utils/date'
import { Container } from '@/src/components/Container'

interface TxNameProps {
  tx: TransactionSummary
}

function TxName({ tx }: TxNameProps) {
  const txType = useTransactionType(tx)

  return (
    <Container marginBottom={20}>
      <Text>{txType.text}</Text>
      <Text>
        {formatDateTime(tx.timestamp)} - {tx.txStatus}
      </Text>
    </Container>
  )
}

export default TxName
