import useChainId from '@/hooks/useChainId'
import { Safe__factory } from '@/types/contracts'
import { Skeleton } from '@mui/material'
import { type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'

import Link from 'next/link'
import { useCurrentChain } from '@/hooks/useChains'
import { AppRoutes } from '@/config/routes'
import { useGetTransactionDetailsQuery } from '@/store/api/gateway'
import { useMemo } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import ExternalLink from '@/components/common/ExternalLink'
import { NestedTransaction } from '../NestedTransaction'
import TxData from '../..'
import { isMultiSendTxInfo, isOrderTxInfo } from '@/utils/transaction-guards'
import { ErrorBoundary } from '@sentry/react'
import Multisend from '../../DecodedData/Multisend'

const safeInterface = Safe__factory.createInterface()

export const OnChainConfirmation = ({
  data,
  isConfirmationView = false,
}: {
  data?: TransactionData
  isConfirmationView?: boolean
}) => {
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
    <NestedTransaction txData={data} isConfirmationView={isConfirmationView}>
      {nestedTxDetails ? (
        <>
          <TxData txDetails={nestedTxDetails} trusted imitation={false} />

          {(isMultiSendTxInfo(nestedTxDetails.txInfo) || isOrderTxInfo(nestedTxDetails.txInfo)) && (
            <ErrorBoundary fallback={<div>Error parsing data</div>}>
              <Multisend txData={nestedTxDetails.txData} />
            </ErrorBoundary>
          )}

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
