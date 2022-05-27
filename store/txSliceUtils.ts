import type { DateLabel, TransactionListItem, TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'

import { isDateLabel, isTransaction } from '@/components/transactions/utils'

export const _hasInitialDateLabel = (results: TransactionListItem[]): boolean => {
  const firstDateLabelIndex = results.findIndex(isDateLabel)
  const firstTxIndex = results.findIndex(isTransaction)

  return firstDateLabelIndex !== -1 && firstTxIndex !== -1 && firstDateLabelIndex < firstTxIndex
}

export const formatTxSlicePayload = (payload: TransactionListPage): TransactionListPage => {
  if (_hasInitialDateLabel(payload.results)) {
    return payload
  }

  const firstTx = payload.results.find(isTransaction)

  if (!firstTx) {
    return payload
  }

  const dateLabel: DateLabel = {
    type: 'DATE_LABEL',
    timestamp: firstTx.transaction.timestamp,
  }

  return {
    ...payload,
    // @ts-expect-error @TODO: Add DateLabel to TransactionListItem type in SDK types
    results: [dateLabel, ...payload.results],
  }
}
