import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useOnboard from '@/hooks/wallets/useOnboard'
import { getSafeSDKWithSigner } from '@/services/tx/tx-sender/sdk'
import { estimateSafeDeploymentGas, estimateSafeTxGas, estimateTxBaseGas } from '@safe-global/protocol-kit'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

type DeployGasLimitProps = {
  baseGas: string
  safeTxGas: string
  safeDeploymentGas: string
  totalGas: bigint
}

const useDeployGasLimit = (safeTx?: SafeTransaction) => {
  const onboard = useOnboard()
  const chainId = useChainId()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<DeployGasLimitProps | undefined>(async () => {
    if (!onboard) return

    const sdk = await getSafeSDKWithSigner(onboard, chainId)

    const [baseGas, safeTxGas, safeDeploymentGas] = await Promise.all([
      safeTx ? estimateTxBaseGas(sdk, safeTx) : '0',
      safeTx ? estimateSafeTxGas(sdk, safeTx) : '0',
      estimateSafeDeploymentGas(sdk),
    ])

    const totalGas = BigInt(baseGas) + BigInt(safeTxGas) + BigInt(safeDeploymentGas)

    return { baseGas, safeTxGas, safeDeploymentGas, totalGas }
  }, [onboard, chainId, safeTx])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useDeployGasLimit
