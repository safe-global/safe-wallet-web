import { Web3Provider } from '@ethersproject/providers'
import Safe, { DeploySafeProps, SafeFactory } from '@gnosis.pm/safe-core-sdk'
import { createEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'

export const createNewSafe = async (ethersProvider: Web3Provider, props: DeploySafeProps): Promise<Safe> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.deploySafe(props)
}
