import React, { ReactElement, useState } from 'react'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { isMultisigExecutionDetails } from '@/utils/transaction-guards'
import { Operation, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { dateString } from '@/utils/formatters'
import { Button, Typography } from '@mui/material'
import css from './styles.module.css'
import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'

interface Props {
  txDetails: TransactionDetails
}

const Summary = ({ txDetails }: Props): ReactElement => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => {
    setExpanded((val) => !val)
  }

  const { txHash, detailedExecutionInfo, executedAt, txData } = txDetails

  if (!isMultisigExecutionDetails(detailedExecutionInfo)) {
    return <></>
  }

  const { submittedAt, confirmations, safeTxHash, baseGas, gasPrice, gasToken, safeTxGas } = detailedExecutionInfo
  const refundReceiver = detailedExecutionInfo.refundReceiver?.value

  return (
    <>
      <TxDataRow title="Transaction hash:">{generateDataRowValue(txHash, 'hash')}</TxDataRow>
      <TxDataRow title="SafeTxHash:">{generateDataRowValue(safeTxHash, 'hash', false)}</TxDataRow>
      <TxDataRow title="Created:">{dateString(submittedAt)}</TxDataRow>
      <TxDataRow title="Executed:">{executedAt ? dateString(executedAt) : NOT_AVAILABLE}</TxDataRow>

      {/* Advanced TxData */}
      {txData && (
        <>
          <Button className={css.buttonExpand} disableRipple onClick={toggleExpanded}>
            <Typography sx={{ textDecoration: 'underline', cursor: 'pointer' }} variant="body1">
              Advanced Details
            </Typography>
          </Button>
          <div className={`${css.collapsibleSection}${expanded ? 'Expanded' : ''}`}>
            <TxDataRow title="Operation:">
              {`${txData.operation} (${Operation[txData.operation].toLowerCase()})`}
            </TxDataRow>
            <TxDataRow title="safeTxGas:">{safeTxGas}</TxDataRow>
            <TxDataRow title="baseGas:">{baseGas}</TxDataRow>
            <TxDataRow title="gasPrice:">{gasPrice}</TxDataRow>
            <TxDataRow title="gasToken:">{generateDataRowValue(gasToken, 'hash')}</TxDataRow>
            <TxDataRow title="refundReceiver:">{generateDataRowValue(refundReceiver, 'hash')}</TxDataRow>
            {confirmations?.map(({ signature }, index) => (
              <TxDataRow title={`Signature ${index + 1}:`} key={`signature-${index}:`}>
                {generateDataRowValue(signature, 'rawData')}
              </TxDataRow>
            ))}
            <TxDataRow title="Raw data:">{generateDataRowValue(txData.hexData, 'rawData')}</TxDataRow>
          </div>
        </>
      )}
    </>
  )
}

export default Summary
