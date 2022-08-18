import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Skeleton } from '@mui/material'
import useAsync from '@/hooks/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import DecodedTx from '@/components/tx/DecodedTx'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { createExistingTx } from '@/services/tx/txSender'

const getTxs = (txs: TransactionDetails[], chainId: string, safeAddress: string) => {
  return Promise.all(
    txs.map(async (tx) => {
      return await createExistingTx(chainId, safeAddress, tx.txId, tx)
    }),
  )
}

const DecodedTxs = ({ txs, numberOfTxs }: { txs: TransactionDetails[] | undefined; numberOfTxs: number }) => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()

  const [safeTxs, _, loading] = useAsync<SafeTransaction[]>(() => {
    if (!txs) return

    return getTxs(txs, chainId, safeAddress)
  }, [txs, chainId, safeAddress])

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap={2} my={2}>
        {Array.from(Array(numberOfTxs)).map((tx) => (
          <Skeleton key={tx} variant="rectangular" height={52} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    )
  }

  return safeTxs ? (
    <Box mt={2}>
      {safeTxs.map((safeTx) => (
        <DecodedTx key={safeTx.data.nonce} tx={safeTx} />
      ))}
    </Box>
  ) : null
}

export default DecodedTxs
