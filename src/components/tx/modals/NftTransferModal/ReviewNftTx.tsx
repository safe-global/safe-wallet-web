import { type ReactElement } from 'react'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '../../SendFromBlock'
import SignOrExecuteForm from '../../SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import useAsync from '@/hooks/useAsync'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import { createTx } from '@/services/tx/txSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import { type NftTransferParams } from '.'

type ReviewNftTxProps = {
  params: NftTransferParams
  onSubmit: (txId: string) => void
}

const ReviewNftTx = ({ params, onSubmit }: ReviewNftTxProps): ReactElement => {
  const { safeAddress, safe } = useSafeInfo()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!safeAddress) return
    const transferParams = createNftTransferParams(safeAddress, params.recipient, params.token.id, params.token.address)
    return createTx(transferParams)
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
