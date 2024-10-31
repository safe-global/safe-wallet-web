import useChainId from '@/hooks/useChainId'
import { Safe__factory } from '@/types/contracts'
import { Skeleton } from '@mui/material'
import { type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import TxData from '../..'
import ErrorMessage from '@/components/tx/ErrorMessage'

import Link from 'next/link'
import { useCurrentChain } from '@/hooks/useChains'
import { AppRoutes } from '@/config/routes'
import { useGetTransactionDetailsQuery } from '@/store/api/gateway'
import { useMemo } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import ExternalLink from '@/components/common/ExternalLink'
import { NestedTransaction } from '../NestedTransaction'

const safeInterface = Safe__factory.createInterface()

export const OnChainConfirmation = ({ data }: { data?: TransactionData }) => {
  const chain = useCurrentChain()
  const chainId = useChainId()
  const signedHash = useMemo(() => {
    const params = data?.hexData ? safeInterface.decodeFunctionData('approveHash', data?.hexData) : undefined
    if (!params || params.length !== 1 || typeof params[0] !== 'string') {
      return
    }

    return params[0]
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
    <NestedTransaction txData={data}>
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
              legacyBehavior
            >
              <ExternalLink>Open nested transaction</ExternalLink>
            </Link>
          )}
        </>
      ) : txDetailsError ? (
        <ErrorMessage>Could not load details on hash to approve.</ErrorMessage>
      ) : (
        <Skeleton />
      )}
    </NestedTransaction>
  )
}
