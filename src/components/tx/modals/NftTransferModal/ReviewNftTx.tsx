import { type ReactElement } from 'react'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '../../SendFromBlock'
import SignOrExecuteForm from '../../SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import useAsync from '@/hooks/useAsync'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import useTxSender from '@/hooks/useTxSender'
import { type NftTransferParams } from '.'
import ImageFallback from '@/components/common/ImageFallback'
import useSafeAddress from '@/hooks/useSafeAddress'

type ReviewNftTxProps = {
  params: NftTransferParams
  onSubmit: (txId: string) => void
}

const ReviewNftTx = ({ params, onSubmit }: ReviewNftTxProps): ReactElement => {
  const { createTx } = useTxSender()
  const safeAddress = useSafeAddress()
  const { token } = params

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    const transferParams = createNftTransferParams(safeAddress, params.recipient, params.token.id, params.token.address)
    return createTx(transferParams, params.txNonce)
  }, [safeAddress, params, createTx])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <ImageFallback
          src={token.imageUri || token.logoUri}
          fallbackSrc="/images/common/nft-placeholder.png"
          alt={token.tokenSymbol}
          height={60}
          style={{ borderRadius: 4, marginBottom: 'var(--space-1)' }}
        />

        <Typography color="text.secondary">{token.tokenName}</Typography>
        <Typography>{token.name || `${token.tokenName} #${token.id}`}</Typography>
      </Box>

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
