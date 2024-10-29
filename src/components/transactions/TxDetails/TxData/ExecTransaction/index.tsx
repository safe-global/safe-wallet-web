import { Safe__factory } from '@/types/contracts'
import { Link as MuiLink, Skeleton, Stack, Typography } from '@mui/material'
import { type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import TxData from '../index'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { MethodDetails } from '../DecodedData/MethodDetails'
import MethodCall from '../DecodedData/MethodCall'
import { Divider } from '@/components/tx/DecodedTx'
import Link from 'next/link'
import { useCurrentChain } from '@/hooks/useChains'
import { AppRoutes } from '@/config/routes'
import { useGetTransactionDetailsQuery } from '@/store/api/gateway'
import { useEffect, useMemo, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { SafeTransaction, SafeTransactionData } from '@safe-global/safe-core-sdk-types'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import Safe from '@safe-global/protocol-kit'

export const ExecTransaction = ({ data }: { data?: TransactionData }) => {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()

  const [childSafeCoreSDK, setChildSafeCoreSDK] = useState<Safe | undefined>()
  const [childSafeNonce, setChildSafeNonce] = useState<number | undefined>()
  const [childSafeTxHash, setChildSafeTxHash] = useState<string | undefined>()

  useEffect(() => {
    if (web3ReadOnly && data?.to.value) {
      Safe.init({
        provider: web3ReadOnly._getConnection().url,
        safeAddress: data.to.value,
      }).then(setChildSafeCoreSDK)
    }
  }, [web3ReadOnly, data?.to.value])

  useEffect(() => {
    if (childSafeCoreSDK) {
      childSafeCoreSDK.getNonce().then(setChildSafeNonce)
    }
  }, [childSafeCoreSDK])

  const childSafeTxData = useMemo<SafeTransactionData | undefined>(() => {
    if (!childSafeNonce) {
      return
    }

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
      safeTxGas: params[4],
      baseGas: params[5],
      gasPrice: params[6],
      gasToken: params[7],
      refundReceiver: params[8],
      nonce: childSafeNonce - 1,
    }
  }, [data?.hexData, childSafeNonce])

  useEffect(() => {
    if (childSafeTxData && childSafeCoreSDK) {
      childSafeCoreSDK.getTransactionHash({ data: childSafeTxData } as SafeTransaction).then(setChildSafeTxHash)
    }
  }, [childSafeTxData, childSafeCoreSDK])

  const { data: nestedTxDetails, error: txDetailsError } = useGetTransactionDetailsQuery(
    childSafeTxHash && chain?.chainId
      ? {
          chainId: chain.chainId,
          txId: childSafeTxHash,
        }
      : skipToken,
  )

  return (
    <Stack spacing={2}>
      {data?.dataDecoded && <MethodCall contractAddress={data?.to.value} method={data.dataDecoded?.method} />}

      {data?.dataDecoded && <MethodDetails data={data.dataDecoded} addressInfoIndex={data.addressInfoIndex} />}

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h5">Nested transaction:</Typography>
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
          <ErrorMessage>Could not load details on executed transaction.</ErrorMessage>
        ) : (
          <Skeleton />
        )}
      </Stack>
    </Stack>
  )
}
