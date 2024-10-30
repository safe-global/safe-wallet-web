import useChainId from '@/hooks/useChainId'
import { Safe__factory } from '@/types/contracts'
import { Link as MuiLink, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import { type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import TxData from '..'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { MethodDetails } from '../DecodedData/MethodDetails'

import MethodCall from '../DecodedData/MethodCall'
import { Divider } from '@/components/tx/DecodedTx'
import Link from 'next/link'
import { useCurrentChain } from '@/hooks/useChains'
import { AppRoutes } from '@/config/routes'
import { useGetTransactionDetailsQuery } from '@/store/api/gateway'
import { useMemo } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import NestedTransactionIcon from '@/public/images/transactions/nestedTx.svg'

export const OnChainConfirmation = ({ data }: { data?: TransactionData }) => {
  const chain = useCurrentChain()
  const chainId = useChainId()
  const signedHash = useMemo(() => {
    const safeInterface = Safe__factory.createInterface()
    const params = data?.hexData ? safeInterface.decodeFunctionData('approveHash', data?.hexData) : undefined
    if (!params || params.length !== 1) {
      return
    }

    const signedHash = params[0] as string
    return signedHash
  }, [data?.hexData])

  const { data: nestedTxDetails, error: txDetailsError } = useGetTransactionDetailsQuery(
    signedHash
      ? {
          chainId,
          txId: signedHash,
        }
      : skipToken,
  )

  return (
    <Stack spacing={2}>
      {data?.dataDecoded && <MethodCall contractAddress={data?.to.value} method={data.dataDecoded?.method} />}

      {data?.dataDecoded && <MethodDetails data={data.dataDecoded} addressInfoIndex={data.addressInfoIndex} />}

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h5" display="flex" alignItems="center" gap={1}>
          <SvgIcon component={NestedTransactionIcon} inheritViewBox fontSize="small" /> Nested transaction:
        </Typography>{' '}
        {nestedTxDetails ? (
          <>
            <TxData txDetails={nestedTxDetails} trusted imitation={false} />

            {chain && data && (
              <Link
                href={{
                  pathname: AppRoutes.transactions.tx,
                  query: {
                    safe: `${chain?.shortName}:${data?.to.value}`,
                    id: nestedTxDetails.txId,
                  },
                }}
                passHref
              >
                <MuiLink>Open nested transaction</MuiLink>
              </Link>
            )}
          </>
        ) : txDetailsError ? (
          <ErrorMessage>Could not load details on hash to approve.</ErrorMessage>
        ) : (
          <Skeleton />
        )}
      </Stack>
    </Stack>
  )
}
