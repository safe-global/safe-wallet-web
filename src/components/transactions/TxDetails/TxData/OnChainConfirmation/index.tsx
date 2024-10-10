import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { Safe__factory } from '@/types/contracts'
import { Stack, Skeleton, Typography } from '@mui/material'
import { type TransactionData, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import TxData from '..'
import ErrorMessage from '@/components/tx/ErrorMessage'
import css from './styles.module.css'

import { MethodDetails } from '../DecodedData/MethodDetails'
import SendToBlock from '@/components/tx/SendToBlock'

export const OnChainConfirmation = ({ data }: { data?: TransactionData }) => {
  const chainId = useChainId()
  const [nestedTxDetails, txDetailsError] = useAsync(async () => {
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
    <Stack spacing={2}>
      <Typography mr={2}>This is a on-chain confirmation of a transaction in a nested Safe</Typography>
      {data?.to.value && <SendToBlock address={data.to.value} title="Nested Safe" />}
      {data?.dataDecoded && <MethodDetails data={data.dataDecoded} addressInfoIndex={data.addressInfoIndex} />}

      <Stack className={css.nestedTx} spacing={2}>
        <Typography variant="h5">Nested Transaction decoded</Typography>
        {nestedTxDetails ? (
          <TxData txDetails={nestedTxDetails} trusted imitation={false} />
        ) : txDetailsError ? (
          <ErrorMessage>Could not load details on hash to approve.</ErrorMessage>
        ) : (
          <Skeleton />
        )}
      </Stack>
    </Stack>
  )
}
