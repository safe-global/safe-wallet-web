import { Safe__factory } from '@/types/contracts'
import { Link as MuiLink, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import { getConfirmationView, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { MethodDetails } from '../DecodedData/MethodDetails'
import MethodCall from '../DecodedData/MethodCall'
import DecodedTx, { Divider } from '@/components/tx/DecodedTx'
import Link from 'next/link'
import { useCurrentChain } from '@/hooks/useChains'
import { AppRoutes } from '@/config/routes'
import { useMemo } from 'react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import useAsync from '@/hooks/useAsync'
import NestedTransactionIcon from '@/public/images/transactions/nestedTx.svg'

const safeInterface = Safe__factory.createInterface()

const extractTransactionData = (data: string | undefined): SafeTransaction | undefined => {
  const params = data ? safeInterface.decodeFunctionData('execTransaction', data) : undefined
  if (!params || params.length !== 10) {
    return
  }

  return {
    addSignature: () => {},
    encodedSignatures: () => params[9],
    getSignature: () => undefined,
    data: {
      to: params[0],
      value: params[1],
      data: params[2],
      operation: params[3] as number,
      safeTxGas: params[4],
      baseGas: params[5],
      gasPrice: params[6],
      gasToken: params[7],
      refundReceiver: params[8],
      nonce: 0,
    },
    signatures: new Map(),
  }
}

export const ExecTransaction = ({ data }: { data?: TransactionData }) => {
  const chain = useCurrentChain()

  const childSafeTx = useMemo<SafeTransaction | undefined>(() => extractTransactionData(data?.hexData), [data?.hexData])

  const [dataDecoded, error] = useAsync(async () => {
    if (chain?.chainId && data?.to.value && childSafeTx) {
      return await getConfirmationView(
        chain.chainId,
        data.to.value,
        childSafeTx.data.data,
        childSafeTx.data.to,
        childSafeTx.data.value.toString(),
      )
    }
  }, [chain?.chainId, data?.to.value, childSafeTx])

  const decodedDataBlock = dataDecoded ? (
    <DecodedTx tx={childSafeTx} showMethodCall decodedData={dataDecoded} showAdvancedDetails={false} />
  ) : null

  return (
    <Stack spacing={2}>
      {data?.dataDecoded && (
        <>
          <MethodCall contractAddress={data.to.value} method={data.dataDecoded.method} />
          <MethodDetails data={data.dataDecoded} addressInfoIndex={data.addressInfoIndex} />
        </>
      )}

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h5" display="flex" alignItems="center" gap={1}>
          <SvgIcon component={NestedTransactionIcon} inheritViewBox fontSize="small" /> Nested transaction:
        </Typography>
        {decodedDataBlock ? (
          <>
            {decodedDataBlock}

            {chain && data && (
              <Link
                href={{
                  pathname: AppRoutes.transactions.history,
                  query: { safe: `${chain.shortName}:${data.to.value}` },
                }}
                passHref
              >
                <MuiLink>Open Safe</MuiLink>
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
