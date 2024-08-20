import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import { estimateSafeCreationGas, type SafeCreationProps } from '@/components/new-safe/create/logic'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import type { ContractNetworkConfig } from '@safe-global/protocol-kit'

export const useEstimateSafeCreationGas = (
  safeParams: SafeCreationProps,
  safeVersion?: SafeVersion,
  contractAddresses?: ContractNetworkConfig,
): {
  gasLimit?: bigint
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const wallet = useWallet()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<bigint>(() => {
    if (!wallet?.address || !chain || !web3ReadOnly) return

    return estimateSafeCreationGas(chain, web3ReadOnly, wallet.address, safeParams, safeVersion, contractAddresses)
  }, [wallet, chain, web3ReadOnly, safeParams, safeVersion, contractAddresses])

  return { gasLimit, gasLimitError, gasLimitLoading }
}
