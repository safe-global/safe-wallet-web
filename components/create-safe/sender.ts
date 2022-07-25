import { Web3Provider } from '@ethersproject/providers'
import Safe, { DeploySafeProps, SafeFactory } from '@gnosis.pm/safe-core-sdk'
import { createEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { EMPTY_DATA, ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  getProxyFactoryContractInstance,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { SafeCreationProps } from '@/components/create-safe/useEstimateSafeCreationGas'

export const createNewSafe = async (ethersProvider: Web3Provider, props: DeploySafeProps): Promise<Safe> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.deploySafe(props)
}

export const getSafeCreationTx = ({
  owners,
  threshold,
  saltNonce,
  chain,
}: SafeCreationProps & { chain: ChainInfo | undefined }) => {
  if (!chain) return

  const safeContract = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION)
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)
  const fallbackHandlerContract = getFallbackHandlerContractInstance(chain.chainId)

  const setupData = safeContract.interface.encodeFunctionData('setup', [
    owners,
    threshold,
    ZERO_ADDRESS,
    EMPTY_DATA,
    fallbackHandlerContract.address,
    ZERO_ADDRESS,
    '0',
    ZERO_ADDRESS,
  ])

  return proxyContract.interface.encodeFunctionData('createProxyWithNonce', [
    safeContract.address,
    setupData,
    saltNonce,
  ])
}
