import React from 'react'
import { Text } from 'react-native-paper'
import { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'

import { useTransactionType } from '@/src/hooks/useTransactionType'
import { formatDateTime } from '@/src/utils/date'
import { StyledTxNameWrapper } from './styled'

interface TxNameProps {
  tx: TransactionSummary
}

function TxName({ tx }: TxNameProps) {
  const txType = useTransactionType(tx)

  return (
    <StyledTxNameWrapper>
      <Text>{txType.text}</Text>
      <Text>
        {formatDateTime(tx.timestamp)} - {tx.txStatus}
      </Text>
    </StyledTxNameWrapper>
  )
}

export default TxName
