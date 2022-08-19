import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Skeleton } from '@mui/material'
import useAsync from '@/hooks/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import DecodedTx from '@/components/tx/DecodedTx'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getSafeTxs } from '@/utils/transactions'

const DecodedTxs = ({ txs, numberOfTxs }: { txs: TransactionDetails[] | undefined; numberOfTxs: number }) => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()

  const [safeTxs, _, loading] = useAsync<SafeTransaction[]>(() => {
    if (!txs) return

    return getSafeTxs(txs, chainId, safeAddress)
  }, [txs, chainId, safeAddress])

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap={2} my={1}>
        {Array.from(Array(numberOfTxs)).map((tx) => (
          <Skeleton key={tx} variant="rectangular" height={52} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    )
  }

  return safeTxs && txs ? (
    <Box mt={1}>
      {safeTxs.map((safeTx, idx) => (
        <DecodedTx key={safeTx.data.nonce} tx={safeTx} txId={txs[idx].txId} />
      ))}
    </Box>
  ) : null
}

export default DecodedTxs
