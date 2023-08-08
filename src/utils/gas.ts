import chains from '@/config/chains'
import type { EstimatedGasPrice } from '@/hooks/useGasPrice'
import { BigNumber } from 'ethers'

const OPTIMISM_MINIMUM_BASE_FEE_WEI = BigNumber.from(100000000)

export const adjustGasEstimationForChain = (gas: EstimatedGasPrice, chainId: string | undefined) => {
  if (chainId === chains.oeth) {
    // On Optimism we lower bound the base fee to 0.1 gwei because the base fee can spike quite fast
    return {
      ...gas,
      maxFeePerGas: gas.maxFeePerGas?.lt(OPTIMISM_MINIMUM_BASE_FEE_WEI)
        ? OPTIMISM_MINIMUM_BASE_FEE_WEI
        : gas.maxFeePerGas,
    }
  }

  return gas
}
