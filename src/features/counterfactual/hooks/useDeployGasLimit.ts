import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useOnboard from '@/hooks/wallets/useOnboard'
import { getSafeSDKWithSigner } from '@/services/tx/tx-sender/sdk'
import { estimateSafeDeploymentGas, estimateSafeTxGas, estimateTxBaseGas } from '@safe-global/protocol-kit'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

const useDeployGasLimit = (safeTx?: SafeTransaction) => {
  const onboard = useOnboard()
  const chainId = useChainId()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<bigint | undefined>(async () => {
    if (!safeTx || !onboard) return

    const sdk = await getSafeSDKWithSigner(onboard, chainId)

    const gas = await estimateTxBaseGas(sdk, safeTx)
    const safeTxGas = await estimateSafeTxGas(sdk, safeTx)
    const safeDeploymentGas = await estimateSafeDeploymentGas(sdk)

    return BigInt(gas) + BigInt(safeTxGas) + BigInt(safeDeploymentGas)
  }, [onboard, chainId, safeTx])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useDeployGasLimit
