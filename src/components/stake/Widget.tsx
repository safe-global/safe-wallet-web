import '@stakekit/widget/package/css'
import { SKApp, darkTheme, lightTheme } from '@stakekit/widget'
import { useDarkMode } from '../../hooks/useDarkMode'
import css from './styles.module.css'
import useSafeWalletProvider, { _useTxFlowApi } from '../../services/safe-wallet-provider/useSafeWalletProvider'
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import useSafeInfo from '../../hooks/useSafeInfo'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import type { AppInfo } from '../../services/safe-wallet-provider'

export const Widget = () => {
  const safeProvider = useSafeWalletProvider()
  const { safe, safeAddress } = useSafeInfo()
  const txFlowApi = _useTxFlowApi(safe.chainId, safeAddress)
  const darkMode = useDarkMode()

  const providerParams = useMemo<NonNullable<ComponentProps<typeof SKApp>['externalProviders']> | null>(() => {
    if (!safeProvider || !txFlowApi) return null

    return {
      type: 'safe_wallet',
      provider: {
        getAccounts: safeProvider.eth_accounts.bind(safeProvider),
        getChainId: safeProvider.eth_chainId.bind(safeProvider),
        getTransactionReceipt: safeProvider.eth_getTransactionReceipt.bind(safeProvider),
        switchEthereumChain: safeProvider.wallet_switchEthereumChain.bind(safeProvider),
        sendTransactions: ({
          txs,
          appInfo,
        }: {
          txs: {
            gas: string | number
            to: string
            value: string
            data: string
          }[]
          appInfo: AppInfo
        }) =>
          txFlowApi
            .send(
              {
                txs,
                params: { safeTxGas: 0, operation: txs.length > 1 ? OperationType.DelegateCall : OperationType.Call },
              },
              appInfo,
            )
            .then((res) => ({ hash: res.txHash ?? res.safeTxHash })),
      },
    }
  }, [safeProvider, txFlowApi])

  if (!providerParams) return null
  return (
    <main className={css.widgetRoot}>
      <SKApp
        theme={darkMode ? darkTheme : lightTheme}
        externalProviders={providerParams}
        apiKey="3e82ff42-9fc4-49a7-b9b4-66da4d7c0f04"
      />
    </main>
  )
}
