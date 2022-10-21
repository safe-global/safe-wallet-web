import type { Web3Provider } from '@ethersproject/providers'
import type { DeploySafeProps } from '@gnosis.pm/safe-core-sdk'
import type Safe from '@gnosis.pm/safe-core-sdk'
import { SafeFactory } from '@gnosis.pm/safe-core-sdk'
import { createEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { EMPTY_DATA, ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  getProxyFactoryContractInstance,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import type { SafeCreationProps } from '@/components/create-safe/useEstimateSafeCreationGas'
import type { PredictSafeProps } from '@gnosis.pm/safe-core-sdk/dist/src/safeFactory'
import type { SafeFormData } from '@/components/create-safe/types'
import type { ConnectedWallet } from '@/services/onboard'
import { BigNumber } from '@ethersproject/bignumber'

export const createNewSafe = async (ethersProvider: Web3Provider, props: DeploySafeProps): Promise<Safe> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.deploySafe(props)
}

export const computeNewSafeAddress = async (ethersProvider: Web3Provider, props: PredictSafeProps): Promise<string> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.predictSafeAddress(props)
}

export const getSafeCreationTx = ({
  owners,
  threshold,
  saltNonce,
  chain,
}: SafeCreationProps & { chain: ChainInfo }) => {
  const safeContract = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION)
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)
  const fallbackHandlerContract = getFallbackHandlerContractInstance(chain.chainId)

  const setupData = safeContract.encode('setup', [
    owners,
    threshold,
    ZERO_ADDRESS,
    EMPTY_DATA,
    fallbackHandlerContract.address,
    ZERO_ADDRESS,
    '0',
    ZERO_ADDRESS,
  ])

  return proxyContract.encode('createProxyWithNonce', [safeContract.getAddress(), setupData, saltNonce])
}

// Returns an object that can be used to detect a replacement tx
// via ethers _waitForTransaction
export const getSafeCreationTxInfo = async (
  provider: Web3Provider,
  params: SafeFormData,
  chain: ChainInfo,
  saltNonce: number,
  wallet: ConnectedWallet,
) => {
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)

  const data = getSafeCreationTx({
    owners: params.owners.map((owner) => owner.address),
    threshold: params.threshold,
    saltNonce,
    chain,
  })

  return {
    data,
    from: wallet.address,
    nonce: await provider.getTransactionCount(wallet.address),
    to: proxyContract.getAddress(),
    value: BigNumber.from(0),
    startBlock: await provider.getBlockNumber(),
  }
}
