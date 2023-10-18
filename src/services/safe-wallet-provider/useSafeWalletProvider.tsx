import { useContext, useEffect, useMemo, useRef } from 'react'
import { BigNumber } from 'ethers'
import { useRouter } from 'next/router'

import { RpcErrorCode } from '.'
import type { AppInfo, WalletSDK } from '.'
import { SafeWalletProvider } from '.'
import useSafeInfo from '@/hooks/useSafeInfo'
import { TxModalContext } from '@/components/tx-flow'
import SignMessageFlow from '@/components/tx-flow/flows/SignMessage'
import { safeMsgSubscribe, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import SafeAppsTxFlow from '@/components/tx-flow/flows/SafeAppsTx'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import type { EIP712TypedData } from '@safe-global/safe-apps-sdk'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { getAddress } from 'ethers/lib/utils'
import { AppRoutes } from '@/config/routes'
import useChains from '@/hooks/useChains'
import { NotificationMessages, showNotification } from './notifications'
import { SafeAppsTag } from '@/config/constants'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'

const useWalletConnectApp = () => {
  const [matchingApps] = useRemoteSafeApps(SafeAppsTag.WALLET_CONNECT)
  return matchingApps?.[0]
}

export const _useTxFlowApi = (chainId: string, safeAddress: string): WalletSDK | undefined => {
  const { setTxFlow } = useContext(TxModalContext)
  const web3ReadOnly = useWeb3ReadOnly()
  const router = useRouter()
  const { configs } = useChains()
  const pendingTxs = useRef<Record<string, string>>({})
  const wcApp = useWalletConnectApp()

  useEffect(() => {
    const unsubscribe = txSubscribe(TxEvent.PROCESSING, async ({ txId, txHash }) => {
      if (!txId) return
      pendingTxs.current[txId] = txHash
    })
    return unsubscribe
  }, [])

  return useMemo<WalletSDK | undefined>(() => {
    if (!chainId || !safeAddress) return

    const signMessage = (message: string | EIP712TypedData, appInfo: AppInfo): Promise<{ signature: string }> => {
      const id = Math.random().toString(36).slice(2)
      setTxFlow(<SignMessageFlow logoUri={appInfo.iconUrl} name={appInfo.name} message={message} requestId={id} />)

      const { title, options } = NotificationMessages.SIGNATURE_REQUEST(appInfo)
      showNotification(title, options)

      return new Promise((resolve, reject) => {
        let unsubscribeSignaturePrepared: (() => void) | null = null
        let unsubscribeUserQuit: (() => void) | null = null

        const unsubscribe = () => {
          unsubscribeSignaturePrepared?.()
          unsubscribeUserQuit?.()
        }

        unsubscribeSignaturePrepared = safeMsgSubscribe(SafeMsgEvent.SIGNATURE_PREPARED, ({ requestId, signature }) => {
          if (requestId === id) {
            resolve({ signature })
            unsubscribe()
          }
        })

        unsubscribeUserQuit = txSubscribe(TxEvent.USER_QUIT, () => {
          reject({
            code: RpcErrorCode.USER_REJECTED,
            message: 'User rejected signature request',
          })
          unsubscribe()
        })
      })
    }

    return {
      async signMessage(message, appInfo) {
        return await signMessage(message, appInfo)
      },

      async signTypedMessage(typedData, appInfo) {
        return await signMessage(typedData as EIP712TypedData, appInfo)
      },

      async send(params: { txs: any[]; params: { safeTxGas: number } }, appInfo) {
        const id = Math.random().toString(36).slice(2)

        const transactions = params.txs.map(({ to, value, data }) => {
          return {
            to: getAddress(to),
            value: BigNumber.from(value).toString(),
            data,
          }
        })

        setTxFlow(
          <SafeAppsTxFlow
            data={{
              appId: undefined,
              app: {
                name: appInfo.name,
                // Show WC details in transaction list
                url: wcApp?.url ?? appInfo.url,
                iconUrl: appInfo.iconUrl,
              },
              requestId: id,
              txs: transactions,
              params: params.params,
            }}
          />,
        )

        const { title, options } = NotificationMessages.TRANSACTION_REQUEST(appInfo)
        showNotification(title, options)

        return new Promise((resolve, reject) => {
          let unsubscribeSignaturePrepared: (() => void) | null = null
          let unsubscribeUserQuit: (() => void) | null = null

          const unsubscribe = () => {
            unsubscribeSignaturePrepared?.()
            unsubscribeUserQuit?.()
          }

          unsubscribeSignaturePrepared = txSubscribe(
            TxEvent.SAFE_APPS_REQUEST,
            async ({ safeAppRequestId, safeTxHash, txId }) => {
              if (safeAppRequestId === id) {
                const txHash = txId ? pendingTxs.current[txId] : undefined
                resolve({ safeTxHash, txHash })
                unsubscribe()
              }
            },
          )

          unsubscribeUserQuit = txSubscribe(TxEvent.USER_QUIT, () => {
            reject({
              code: RpcErrorCode.USER_REJECTED,
              message: 'User rejected transaction',
            })
            unsubscribe()
          })
        })
      },

      async getBySafeTxHash(safeTxHash) {
        return getTransactionDetails(chainId, safeTxHash)
      },

      async switchChain(hexChainId, appInfo) {
        const decimalChainId = parseInt(hexChainId, 16).toString()
        if (decimalChainId === chainId) {
          return null
        }

        const cfg = configs.find((c) => c.chainId === chainId)
        if (!cfg) {
          throw new Error(`Chain ${chainId} not supported`)
        }

        if (prompt(`${appInfo.name} wants to switch to ${cfg.shortName}. Do you want to continue?`)) {
          router.push({
            pathname: AppRoutes.index,
            query: {
              chain: cfg.shortName,
            },
          })
        }

        return null
      },

      async proxy(method, params) {
        const data = await web3ReadOnly?.send(method, params)
        return data.result
      },
    }
  }, [chainId, safeAddress, setTxFlow, wcApp?.url, configs, router, web3ReadOnly])
}

const useSafeWalletProvider = (): SafeWalletProvider | undefined => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe

  const txFlowApi = _useTxFlowApi(chainId, safeAddress)

  return useMemo(() => {
    if (!safeAddress || !chainId || !txFlowApi) return

    return new SafeWalletProvider(
      {
        safeAddress,
        chainId: Number(chainId),
      },
      txFlowApi,
    )
  }, [safeAddress, chainId, txFlowApi])
}

export default useSafeWalletProvider
