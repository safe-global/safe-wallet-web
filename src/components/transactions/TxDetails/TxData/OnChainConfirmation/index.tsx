import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { Safe__factory } from '@/types/contracts'
import { Skeleton, Typography } from '@mui/material'
import { type TransactionData, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import TxData from '..'
import ErrorMessage from '@/components/tx/ErrorMessage'

export const OnChainConfirmation = ({ data }: { data?: TransactionData }) => {
  const chainId = useChainId()
  const [nestedTxDetails, txDetailsError, txDetailsLoading] = useAsync(async () => {
    const safeInterface = Safe__factory.createInterface()
    const params = data?.hexData ? safeInterface.decodeFunctionData('approveHash', data?.hexData) : undefined
    if (!params || params.length !== 1) {
      return
    }

    const signedHash = params[0] as string

    // Try to fetch the tx for the hash
    return getTransactionDetails(chainId, signedHash)
  }, [chainId, data?.hexData])

  return (
    <div>
      <Typography mr={2}>This is a on-chain confirmation of a transaction in a nested Safe</Typography>
      {nestedTxDetails ? (
        <TxData txDetails={nestedTxDetails} trusted imitation={false} />
      ) : txDetailsError ? (
        <ErrorMessage>Could not load details on hash to approve.</ErrorMessage>
      ) : (
        <Skeleton />
      )}
    </div>
  )
}
