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
import type { PredictSafeProps } from '@gnosis.pm/safe-core-sdk/dist/src/safeFactory'
import type { SafeFormData } from '@/components/create-safe/types'
import type { ConnectedWallet } from '@/services/onboard'
import { getUserNonce } from '@/hooks/wallets/web3'
import { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'

/**
 * Prepare data for creating a Safe for the Core SDK
 */
export const getSafeDeployProps = (
  safeParams: SafeCreationProps,
  callback: (txHash: string) => void,
  chainId: string,
): PredictSafeProps & { callback: DeploySafeProps['callback'] } => {
  const fallbackHandler = getFallbackHandlerContractInstance(chainId)

  return {
    safeAccountConfig: {
      threshold: safeParams.threshold,
      owners: safeParams.owners,
      fallbackHandler: fallbackHandler.address,
    },
    safeDeploymentConfig: {
      saltNonce: safeParams.saltNonce.toString(),
    },
    callback,
  }
}

/**
 * Create a Safe creation transaction via Core SDK and submits it to the wallet
 */
export const createNewSafe = async (ethersProvider: Web3Provider, props: DeploySafeProps): Promise<Safe> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.deploySafe(props)
}

/**
 * Compute the new counterfactual Safe address before it is actually created
 */
export const computeNewSafeAddress = async (ethersProvider: Web3Provider, props: PredictSafeProps): Promise<string> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.predictSafeAddress(props)
}

/**
 * Encode a Safe creation transaction NOT using the Core SDK because it doesn't support that
 * This is used for gas estimation.
 */
export const encodeSafeCreationTx = ({
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

/**
 * Encode a Safe creation tx in a way that we can store locally and monitor using _waitForTransaction
 */
export const getSafeCreationTxInfo = async (
  provider: Web3Provider,
  params: SafeFormData,
  chain: ChainInfo,
  saltNonce: number,
  wallet: ConnectedWallet,
) => {
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)

  const data = encodeSafeCreationTx({
    owners: params.owners.map((owner) => owner.address),
    threshold: params.threshold,
    saltNonce,
    chain,
  })

  return {
    data,
    from: wallet.address,
    nonce: await getUserNonce(wallet.address),
    to: proxyContract.getAddress(),
    value: BigNumber.from(0),
    startBlock: await provider.getBlockNumber(),
  }
}

export type SafeCreationProps = {
  owners: string[]
  threshold: number
  saltNonce: number
}

export const estimateSafeCreationGas = async (
  chain: ChainInfo,
  provider: JsonRpcProvider,
  from: string,
  safeParams: SafeCreationProps,
): Promise<BigNumber> => {
  const proxyFactoryContract = getProxyFactoryContractInstance(chain.chainId)
  const encodedSafeCreationTx = encodeSafeCreationTx({ ...safeParams, chain })

  return provider.estimateGas({
    from: from,
    to: proxyFactoryContract.getAddress(),
    data: encodedSafeCreationTx,
  })
}
