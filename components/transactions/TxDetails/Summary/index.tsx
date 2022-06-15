import DateTime from '@/components/common/DateTime'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { isMultisigExecutionDetails } from '@/components/transactions/utils'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import React, { ReactElement } from 'react'

export const NOT_AVAILABLE = 'n/a'

interface Props {
  txDetails?: TransactionDetails
}

const Summary = ({ txDetails }: Props): ReactElement => {
  if (!txDetails) return <></>

  const { txHash, detailedExecutionInfo, executedAt, txData, txInfo } = txDetails

  let created, confirmations, safeTxHash, baseGas, gasPrice, gasToken, refundReceiver, safeTxGas
  if (isMultisigExecutionDetails(detailedExecutionInfo)) {
    // prettier-ignore
    ({
      submittedAt: created,
      confirmations,
      safeTxHash,
      baseGas,
      gasPrice,
      gasToken,
      safeTxGas,
    } = detailedExecutionInfo)
    refundReceiver = detailedExecutionInfo.refundReceiver?.value
  }

  return (
    <>
      <TxDataRow title="Transaction hash:" value={txHash} inlineType="hash" />
      <TxDataRow title="SafeTxHash:" value={safeTxHash} inlineType="hash" hasExplorer={false} />
      <TxDataRow
        title="Created:"
        value={
          typeof created === 'number' ? (
            <DateTime
              value={created}
              options={{
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              }}
            />
          ) : null
        }
      />
      <TxDataRow
        title="Executed:"
        value={
          executedAt ? (
            <DateTime
              value={executedAt}
              options={{
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              }}
            />
          ) : (
            NOT_AVAILABLE
          )
        }
      />
      {/* <TxDataRow title="Created:" value={typeof created === 'number' ? formatDateTime(created) : null} />
      <TxDataRow title="Executed:" value={executedAt ? formatDateTime(executedAt) : NOT_AVAILABLE} /> */}
    </>
  )
}

export default Summary
