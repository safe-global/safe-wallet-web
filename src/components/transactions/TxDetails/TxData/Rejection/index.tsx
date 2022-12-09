import ExternalLink from '@/components/common/ExternalLink'
import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'
import type { MultisigExecutionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Typography } from '@mui/material'
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
          <ExternalLink
            href="https://help.safe.global/en/articles/4738501-why-do-i-need-to-pay-for-cancelling-a-transaction"
            title="Why do I need to pay for rejecting a transaction?"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ textDecoration: 'underline' }}>
                Why do I need to pay for rejecting a transaction?
              </Typography>
            </Box>
          </ExternalLink>
        </Box>
      )}
    </>
  )
}

export default RejectionTxInfo
