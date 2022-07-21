import {
  getFallbackHandlerDeployment,
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
  SingletonDeployment,
} from '@gnosis.pm/safe-deployments'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { Contract } from 'ethers'
import { Interface } from '@ethersproject/abi'
import semverSatisfies from 'semver/functions/satisfies'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { Gnosis_safe, Proxy_factory, Multi_send, Compatibility_fallback_handler } from '@/types/contracts'

const getSafeContractDeployment = (chain: ChainInfo, safeVersion: string): SingletonDeployment | undefined => {
  // We check if version is prior to v1.0.0 as they are not supported but still we want to keep a minimum compatibility
  const useOldestContractVersion = semverSatisfies(safeVersion, '<1.0.0')

  // We had L1 contracts in three L2 networks, xDai, EWC and Volta so even if network is L2 we have to check that safe version is after v1.3.0
  const useL2ContractVersion = chain.l2 && semverSatisfies(safeVersion, '>=1.3.0')
  const getDeployment = useL2ContractVersion ? getSafeL2SingletonDeployment : getSafeSingletonDeployment

  return (
    getDeployment({
      version: safeVersion,
      network: chain.chainId,
    }) ||
    getDeployment({
      version: safeVersion,
    }) ||
    // In case we couldn't find a valid deployment and it's a version before 1.0.0 we return v1.0.0 to allow a minimum compatibility
    (useOldestContractVersion
      ? getDeployment({
          version: '1.0.0',
        })
      : undefined)
  )
}

export const getGnosisSafeContractInstance = (chain: ChainInfo, safeVersion: string): Gnosis_safe => {
  const safeSingletonDeployment = getSafeContractDeployment(chain, safeVersion)

  if (!safeSingletonDeployment) {
    throw new Error(`GnosisSafe contract not found for chainId: ${chain.chainId}`)
  }
  const contractAddress = safeSingletonDeployment.networkAddresses[chain.chainId]

  return new Contract(contractAddress, safeSingletonDeployment.abi) as Gnosis_safe
}

/**
 * Creates a Contract instance of the FallbackHandler contract
 * @param {Web3} web3
 * @param {ChainId} chainId
 */
export const getFallbackHandlerContractInstance = (chainId: string): Compatibility_fallback_handler => {
  const fallbackHandlerDeployment =
    getFallbackHandlerDeployment({
      version: LATEST_SAFE_VERSION,
      network: chainId,
    }) ||
    getFallbackHandlerDeployment({
      version: LATEST_SAFE_VERSION,
    })

  if (!fallbackHandlerDeployment) {
    throw new Error(`FallbackHandler contract not found for chainId: ${chainId}`)
  }

  const contractAddress = fallbackHandlerDeployment.networkAddresses[chainId]

  return new Contract(contractAddress, new Interface(fallbackHandlerDeployment.abi)) as Compatibility_fallback_handler
}

/**
 * Creates a Contract instance of the MultiSend contract
 * @param {Web3} web3
 * @param {ChainId} chainId
 */
const getMultiSendContractInstance = (chainId: string): Multi_send => {
  const multiSendDeployment = getMultiSendCallOnlyDeployment({ network: chainId }) || getMultiSendCallOnlyDeployment()

  if (!multiSendDeployment) {
    throw new Error(`MultiSend contract not found for chainId: ${chainId}`)
  }

  const contractAddress = multiSendDeployment.networkAddresses[chainId]

  return new Contract(contractAddress, new Interface(multiSendDeployment.abi)) as Multi_send
}

/**
 * Creates a Contract instance of the GnosisSafeProxyFactory contract
 * @param {Web3} web3
 * @param {ChainId} chainId
 */
export const getProxyFactoryContractInstance = (chainId: string): Proxy_factory => {
  const proxyFactoryDeployment =
    getProxyFactoryDeployment({
      version: LATEST_SAFE_VERSION,
      network: chainId.toString(),
    }) ||
    getProxyFactoryDeployment({
      version: LATEST_SAFE_VERSION,
    })

  if (!proxyFactoryDeployment) {
    throw new Error(`GnosisSafeProxyFactory contract not found for chainId: ${chainId}`)
  }
  const contractAddress = proxyFactoryDeployment.networkAddresses[chainId]

  return new Contract(contractAddress, proxyFactoryDeployment.abi) as Proxy_factory
}
