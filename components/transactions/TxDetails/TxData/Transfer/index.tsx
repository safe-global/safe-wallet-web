import EthHashInfo from '@/components/common/EthHashInfo'
import { TransferTx } from '@/components/transactions/TxInfo'
import { isTransferTxInfo, isTxQueued } from '@/utils/transaction-guards'
import { TransactionStatus, Transfer, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Typography } from '@mui/material'
import React from 'react'

type TransferTxInfoProps = {
  txInfo: Transfer
  txStatus: TransactionStatus
}

const TransferTxInfoSummary = ({ txInfo, txStatus }: TransferTxInfoProps) => {
  if (!isTransferTxInfo(txInfo)) return <></>

  const { direction } = txInfo
  return (
    <Typography>
      {direction === TransferDirection.INCOMING ? 'Received' : isTxQueued(txStatus) ? 'Send' : 'Sent'}{' '}
      <b>
        <TransferTx info={txInfo} withLogo={false} omitSign />
      </b>
      {direction === TransferDirection.INCOMING ? ' from:' : ' to:'}
    </Typography>
  )
}

const TransferTxInfo = ({ txInfo, txStatus }: TransferTxInfoProps) => {
  const address =
    txInfo.direction.toUpperCase() === TransferDirection.INCOMING ? txInfo.sender.value : txInfo.recipient.value
  return (
    <Box>
      <TransferTxInfoSummary txInfo={txInfo} txStatus={txStatus} />
      <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
    </Box>
  )
}

export default TransferTxInfo
