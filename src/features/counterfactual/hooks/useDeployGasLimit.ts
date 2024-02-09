import { id } from 'ethers'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useOnboard from '@/hooks/wallets/useOnboard'
import { getSafeSDKWithSigner } from '@/services/tx/tx-sender/sdk'
import { estimateSafeDeploymentGas, estimateSafeTxGas, estimateTxBaseGas } from '@safe-global/protocol-kit'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

const ADD_OWNER_WITH_THRESHOLD_SIG_HASH = id('addOwnerWithThreshold(address,uint256)').slice(0, 10)
const SWAP_OWNER_SIG_HASH = id('swapOwner(address,address,address)').slice(0, 10)

/**
 * The estimation from the protocol-kit is too low for swapOwner and addOwnerWithThreshold,
 * so we add a fixed amount
 * @param safeTx
 */
const getExtraGasForSafety = (safeTx?: SafeTransaction): bigint => {
  return safeTx?.data.data.startsWith(ADD_OWNER_WITH_THRESHOLD_SIG_HASH) ||
    safeTx?.data.data.startsWith(SWAP_OWNER_SIG_HASH)
    ? 25000n
    : 0n
}

type DeployGasLimitProps = {
  baseGas: string
  safeTxGas: string
  safeDeploymentGas: string
  totalGas: bigint
}

const useDeployGasLimit = (safeTx?: SafeTransaction) => {
  const onboard = useOnboard()
  const chainId = useChainId()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<DeployGasLimitProps | undefined>(
    async () => {
      if (!onboard) return

      const sdk = await getSafeSDKWithSigner(onboard, chainId)

      const extraGasForSafety = getExtraGasForSafety(safeTx)

      const [baseGas, safeTxGas, safeDeploymentGas] = await Promise.all([
        safeTx ? estimateTxBaseGas(sdk, safeTx) : '0',
        safeTx ? estimateSafeTxGas(sdk, safeTx) : '0',
        estimateSafeDeploymentGas(sdk),
      ])

      const totalGas = BigInt(baseGas) + BigInt(safeTxGas) + BigInt(safeDeploymentGas) + extraGasForSafety

      return { baseGas, safeTxGas, safeDeploymentGas, totalGas }
    },
    [onboard, chainId, safeTx],
    false,
  )

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useDeployGasLimit
