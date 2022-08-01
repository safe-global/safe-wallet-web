import { type ReactElement } from 'react'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '../../SendFromBlock'
import SignOrExecuteForm from '../../SignOrExecuteForm'
import { SendNftFormData } from './SendNftForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import useAsync from '@/hooks/useAsync'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import { createTx } from '@/services/tx/txSender'
import useSafeInfo from '@/hooks/useSafeInfo'

type ReviewNftTxProps = {
  params: SendNftFormData
  onSubmit: (data: null) => void
}

const ReviewNftTx = ({ params, onSubmit }: ReviewNftTxProps): ReactElement => {
  const { safeAddress, safe } = useSafeInfo()

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!safeAddress) return
    const transferParams = createNftTransferParams(safeAddress, params.recipient, params.tokenId, params.tokenAddress)
    if (transferParams) {
      return createTx(transferParams)
    }
  }, [safeAddress, params])

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onSubmit} error={safeTxError}>
      <SendFromBlock />

      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Recipient
      </Typography>

      <Box mb={3}>
        <EthHashInfo address={params.recipient} shortAddress={false} hasExplorer showCopyButton />
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewNftTx
