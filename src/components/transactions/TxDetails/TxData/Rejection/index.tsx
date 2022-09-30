import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'
import { MultisigExecutionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Link, Typography } from '@mui/material'
import React from 'react'

interface Props {
  nonce?: MultisigExecutionDetails['nonce']
  isTxExecuted: boolean
}

const RejectionTxInfo = ({ nonce, isTxExecuted }: Props) => {
  const txNonce = nonce ?? NOT_AVAILABLE
  const message = `This is an on-chain rejection that didn't send any funds. ${
    isTxExecuted
      ? `This on-chain rejection replaced all transactions with nonce ${txNonce}.`
      : `Executing this on-chain rejection will replace all currently awaiting transactions with nonce ${txNonce}.`
  }`

  return (
    <>
      <Typography mr={2}>{message}</Typography>
      {!isTxExecuted && (
        <Box mt={2} sx={{ width: 'fit-content' }}>
          <Link
            href="https://help.gnosis-safe.io/en/articles/4738501-why-do-i-need-to-pay-for-cancelling-a-transaction"
            target="_blank"
            rel="noreferrer"
            title="Why do I need to pay for rejecting a transaction?"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ textDecoration: 'underline' }}>
                Why do I need to pay for rejecting a transaction?
              </Typography>
            </Box>
          </Link>
        </Box>
      )}
    </>
  )
}

export default RejectionTxInfo
