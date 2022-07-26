import { getAllowanceModuleDeployment } from '@gnosis.pm/safe-modules-deployments'
import { Contract } from 'ethers'
import { Interface } from '@ethersproject/abi'
import { AllowanceModule } from '@/types/contracts'
import { Web3Provider } from '@ethersproject/providers'

export const getSpendingLimitModuleAddress = (chainId: string): string | undefined => {
  const deployment = getAllowanceModuleDeployment({ network: chainId })

  return deployment?.networkAddresses[chainId]
}

export const getSpendingLimitContract = (chainId: string, provider?: Web3Provider): AllowanceModule => {
  const allowanceModuleDeployment = getAllowanceModuleDeployment({ network: chainId })

  if (!allowanceModuleDeployment) {
    throw new Error(`AllowanceModule contract not found`)
  }

  const contractAddress = allowanceModuleDeployment.networkAddresses[chainId]

  return new Contract(
    contractAddress,
    new Interface(allowanceModuleDeployment.abi),
    provider,
  ) as unknown as AllowanceModule
}
