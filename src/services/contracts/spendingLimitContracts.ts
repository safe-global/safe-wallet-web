import { getAllowanceModuleDeployment } from '@safe-global/safe-modules-deployments'

import type { AllowanceModule } from '@/types/contracts'
import { AllowanceModule__factory } from '@/types/contracts'
import type { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'

export const getSpendingLimitModuleAddress = (chainId: string): string | undefined => {
  const deployment = getAllowanceModuleDeployment({ network: chainId })

  return deployment?.networkAddresses[chainId]
}

// SDK request here: https://github.com/safe-global/safe-core-sdk/issues/263
export const getSpendingLimitContract = (
  chainId: string,
  provider: JsonRpcProvider | JsonRpcSigner,
): AllowanceModule => {
  const allowanceModuleDeployment = getAllowanceModuleDeployment({ network: chainId })

  if (!allowanceModuleDeployment) {
    throw new Error(`AllowanceModule contract not found`)
  }

  const contractAddress = allowanceModuleDeployment.networkAddresses[chainId]

  return AllowanceModule__factory.connect(contractAddress, provider)
}

export const getSpendingLimitInterface = () => {
  return AllowanceModule__factory.createInterface()
}
