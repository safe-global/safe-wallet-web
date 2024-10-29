import { Safe__factory } from '@/types/contracts'
import { Link as MuiLink, Skeleton, Stack, Typography } from '@mui/material'
import { getConfirmationView, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { MethodDetails } from '../DecodedData/MethodDetails'
import MethodCall from '../DecodedData/MethodCall'
import { Divider } from '@/components/tx/DecodedTx'
import Link from 'next/link'
import { useCurrentChain } from '@/hooks/useChains'
import { AppRoutes } from '@/config/routes'
import { useMemo } from 'react'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import useAsync from '@/hooks/useAsync'
import DecodedData from '../DecodedData'

export const ExecTransaction = ({ data }: { data?: TransactionData }) => {
  const chain = useCurrentChain()

  const childSafeTxData = useMemo<MetaTransactionData | undefined>(() => {
    const safeInterface = Safe__factory.createInterface()
    const params = data?.hexData ? safeInterface.decodeFunctionData('execTransaction', data?.hexData) : undefined
    if (!params || params.length !== 10) {
      return
    }

    return {
      to: params[0],
      value: params[1],
      data: params[2],
      operation: params[3] as number,
    }
  }, [data?.hexData])

  const [txData, error] = useAsync(async () => {
    if (chain?.chainId && data?.to.value && childSafeTxData) {
      const dataDecoded = await getConfirmationView(
        chain.chainId,
        data?.to.value,
        childSafeTxData.data,
        childSafeTxData.to,
        childSafeTxData.value.toString(),
      )

      return {
        dataDecoded,
        to: { value: childSafeTxData.to },
        value: childSafeTxData.value,
        hexData: childSafeTxData.data,
        operation: childSafeTxData.operation as number,
        trustedDelegateCallTarget: true,
        addressInfoIndex: {},
      }
    }
  }, [chain?.chainId, data?.to.value, childSafeTxData])

  const decodedDataBlock = txData ? <DecodedData txData={txData} /> : null

  return (
    <Stack spacing={2}>
      {data?.dataDecoded && <MethodCall contractAddress={data?.to.value} method={data.dataDecoded?.method} />}

      {data?.dataDecoded && <MethodDetails data={data.dataDecoded} addressInfoIndex={data.addressInfoIndex} />}

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h5">Nested transaction:</Typography>
        {decodedDataBlock ? (
          <>
            {decodedDataBlock}

            {chain && data && (
              <Link
                href={{
                  pathname: AppRoutes.transactions.history,
                  query: { safe: `${chain?.shortName}:${data?.to.value}` },
                }}
                passHref
              >
                <MuiLink>Open nested transaction</MuiLink>
              </Link>
            )}
          </>
        ) : error ? (
          <ErrorMessage>Could not load details on executed transaction.</ErrorMessage>
        ) : (
          <Skeleton />
        )}
      </Stack>
    </Stack>
  )
}
