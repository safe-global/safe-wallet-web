import { useContext, useMemo } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { SafeWalletProvider } from './provider'
import { TxModalContext } from '@/components/tx-flow'
import SignMessageFlow from '@/components/tx-flow/flows/SignMessage'
import { safeMsgSubscribe, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'
import SafeAppsTxFlow from '@/components/tx-flow/flows/SafeAppsTx'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import type { EIP712TypedData } from '@safe-global/safe-apps-sdk'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { getAddress } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

const useSafeWalletProvider = (): SafeWalletProvider | undefined => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { setTxFlow } = useContext(TxModalContext)
  const web3ReadOnly = useWeb3ReadOnly()

  const txFlowApi = useMemo(() => {
    if (!safeAddress || !chainId) {
      return
    }

    return {
      async signMessage(message: string | EIP712TypedData): Promise<{ signature: string }> {
        const id = Math.random().toString(36).slice(2)
        setTxFlow(<SignMessageFlow logoUri="" name="" message={message} requestId={id} />)

        return new Promise((resolve) => {
          const unsubscribe = safeMsgSubscribe(SafeMsgEvent.SIGNATURE_PREPARED, ({ requestId, signature }) => {
            if (requestId === id) {
              resolve({ signature })
              unsubscribe()
            }
          })
        })
      },

      async signTypedMessage(typedData: unknown): Promise<{ signature: string }> {
        return this.signMessage(typedData as EIP712TypedData)
      },

      async send(params: { txs: any[]; params: { safeTxGas: number } }): Promise<{ safeTxHash: string }> {
        const id = Math.random().toString(36).slice(2)
        console.log('Opening tx flow', params)

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
              requestId: id,
              txs: transactions,
              params: params.params,
            }}
          />,
        )

        return new Promise((resolve) => {
          const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ safeAppRequestId, safeTxHash }) => {
            if (safeAppRequestId === id) {
              resolve({ safeTxHash })
              unsubscribe()
            }
          })
        })
      },

      async getBySafeTxHash(safeTxHash: string) {
        return getTransactionDetails(chainId, safeTxHash)
      },

      async proxy(method: string, params: unknown[]) {
        const data = await web3ReadOnly?.send(method, params)
        return data.result
      },
    }
  }, [safeAddress, chainId, setTxFlow, web3ReadOnly])

  return useMemo(() => {
    if (!safeAddress || !chainId || !txFlowApi) {
      return
    }

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
