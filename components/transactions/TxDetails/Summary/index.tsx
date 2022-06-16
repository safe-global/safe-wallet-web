import React, { ReactElement, useState } from 'react'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { isMultisigExecutionDetails } from '@/components/transactions/utils'
import { Operation, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { dateString } from '@/services/formatters'
import css from './styles.module.css'

export const NOT_AVAILABLE = 'n/a'

interface Props {
  txDetails?: TransactionDetails
}

const Summary = ({ txDetails }: Props): ReactElement => {
  const [expanded, setExpanded] = useState(false)

  if (!txDetails) return <></>

  const toggleExpanded = () => {
    setExpanded((val) => !val)
  }

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
      <TxDataRow title="Created:" value={typeof created === 'number' ? dateString(created) : null} />
      <TxDataRow title="Executed:" value={executedAt ? dateString(executedAt) : NOT_AVAILABLE} />

      {/* Advanced TxData */}
      {txData && (
        <>
          <button className={css.buttonLink} onClick={toggleExpanded}>
            Advanced Details
          </button>
          <div className={`${css.collapsibleSection}${expanded ? 'Expanded' : ''}`}>
            {txData?.operation !== undefined && (
              <TxDataRow
                title="Operation:"
                value={`${txData.operation} (${Operation[txData.operation].toLowerCase()})`}
              />
            )}
            <TxDataRow title="safeTxGas:" value={safeTxGas} />
            <TxDataRow title="baseGas:" value={baseGas} />
            <TxDataRow title="gasPrice:" value={gasPrice} />
            <TxDataRow title="gasToken:" value={gasToken} inlineType="hash" />
            <TxDataRow title="refundReceiver:" value={refundReceiver} inlineType="hash" />
            {confirmations?.map(({ signature }, index) => (
              <TxDataRow
                title={`Signature ${index + 1}:`}
                key={`signature-${index}:`}
                value={signature}
                inlineType="rawData"
              />
            ))}
            <TxDataRow title="Raw data:" value={txData.hexData} inlineType="rawData" />
          </div>
        </>
      )}
    </>
  )
}

export default Summary
