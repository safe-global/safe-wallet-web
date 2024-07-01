import { OperationType } from '@safe-global/safe-core-sdk-types'
import { getSafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { SKAppProps } from '@stakekit/widget'
import { useEffect, useMemo, useRef } from 'react'
import { STAKEKIT_KEY } from '../../config/constants'
import useSafeInfo from '../../hooks/useSafeInfo'
import type { AppInfo } from '../../services/safe-wallet-provider'
import useSafeWalletProvider, { _useTxFlowApi } from '../../services/safe-wallet-provider/useSafeWalletProvider'

export const useSKProvider = () => {
  const safeProvider = useSafeWalletProvider()
  const { safe, safeAddress } = useSafeInfo()
  const txFlowApi = _useTxFlowApi(safe.chainId, safeAddress)

  const timeoutId = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      clearTimeout(timeoutId.current)
    }
  }, [])

  return useMemo<{
    externalProviders: NonNullable<SKAppProps['externalProviders']>
    apiKey: SKAppProps['apiKey']
  } | null>(() => {
    if (!STAKEKIT_KEY) throw new Error('StakeKit API key is required')

    if (!safeProvider || !txFlowApi) return null

    return {
      apiKey: STAKEKIT_KEY,
      externalProviders: {
        type: 'generic',
        currentChain: Number(safe.chainId),
        currentAddress: safeAddress,
        supportedChainIds: [Number(safe.chainId)],
        provider: {
          getAccounts: () => safeProvider.eth_accounts(),
          getChainId: () => safeProvider.eth_chainId().then((res) => parseInt(res, 16)),
          getTransactionReceipt: (txHash) =>
            safeProvider
              .eth_getTransactionReceipt(txHash)
              .then((res) => res as { transactionHash?: string | undefined }),
          switchChain: async (chainId) => {
            await safeProvider.wallet_switchEthereumChain({ chainId }, appInfo)
          },
          signMessage: (message) =>
            txFlowApi.signMessage(message, appInfo).then((res) => {
              if (res.signature) return res.signature

              return new Promise<string>((resolve) => {
                const check = async () => {
                  const result = await getSafeMessage(safe.chainId, res.messageHash)

                  if (result.preparedSignature) {
                    resolve(result.preparedSignature)
                  } else {
                    clearTimeout(timeoutId.current)
                    timeoutId.current = setTimeout(check, 5000)
                  }
                }

                check()
              })
            }),
          sendTransactions: (txs) =>
            txFlowApi
              .send(
                {
                  txs: txs.map((v) => ({ data: v.data, gas: v.gas, to: v.to, value: v.value ?? '0' })),
                  params: { safeTxGas: 0, operation: txs.length > 1 ? OperationType.DelegateCall : OperationType.Call },
                },
                appInfo,
              )
              .then((res) => res.txHash ?? res.safeTxHash),
        },
      },
    }
  }, [safe.chainId, safeAddress, safeProvider, txFlowApi])
}

const appInfo: AppInfo = {
  description: 'StakeKit',
  iconUrl: 'https://assets.stakek.it/stakekit/sk-icon_320x320.png',
  id: 0,
  name: 'StakeKit',
  url: 'https://stakek.it',
}
