import ExternalLink from '@/components/common/ExternalLink'
import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'
import { HelpCenterArticle } from '@/config/constants'
import { Box, Typography } from '@mui/material'
import type { MultisigExecutionDetails } from '@safe-global/safe-gateway-typescript-sdk'

interface Props {
  nonce?: MultisigExecutionDetails['nonce']
  isTxExecuted: boolean
}

const RejectionTxInfo = ({ nonce, isTxExecuted }: Props) => {
  const txNonce = nonce ?? NOT_AVAILABLE
  const message = `This is an on-chain rejection that ${isTxExecuted ? "didn't" : "won't"} send any funds. ${
    isTxExecuted
      ? `This on-chain rejection replaced all transactions with nonce ${txNonce}.`
      : `Executing this on-chain rejection will replace all currently awaiting transactions with nonce ${txNonce}.`
  }`

  const title = 'Why do I need to pay to reject a transaction?'

  return (
    <>
      <Typography data-testid="onchain-rejection" mr={2}>
        {message}
      </Typography>
      {!isTxExecuted && (
        <Box data-sid="61951" mt={2} sx={{ width: 'fit-content' }}>
          <ExternalLink href={HelpCenterArticle.CANCELLING_TRANSACTIONS} title={title}>
            <Box data-sid="23219" sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ textDecoration: 'underline' }}>{title}</Typography>
            </Box>
          </ExternalLink>
        </Box>
      )}
    </>
  )
}

export default RejectionTxInfo
