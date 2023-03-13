import EthHashInfo from '@/components/common/EthHashInfo'
import { TransferTx } from '@/components/transactions/TxInfo'
import { isTxQueued } from '@/utils/transaction-guards'
import type { TransactionStatus, Transfer } from '@safe-global/safe-gateway-typescript-sdk'
import { TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Typography } from '@mui/material'
import React from 'react'

import TransferActions from '@/components/transactions/TxDetails/TxData/Transfer/TransferActions'

type TransferTxInfoProps = {
  txInfo: Transfer
  txStatus: TransactionStatus
}

const TransferTxInfoSummary = ({ txInfo, txStatus }: TransferTxInfoProps) => {
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
      <Box display="flex" alignItems="center">
        <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton>
          <TransferActions address={address} txInfo={txInfo} />
        </EthHashInfo>
      </Box>
    </Box>
  )
}

export default TransferTxInfo
