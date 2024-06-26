import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { SafeProvider } from '@safe-global/protocol-kit'
import {
  getCompatibilityFallbackHandlerContractInstance,
  getMultiSendCallOnlyContractInstance,
  getSafeContractInstance,
  getSafeProxyFactoryContractInstance,
  getSignMessageLibContractInstance,
} from '@safe-global/protocol-kit/dist/src/contracts/contractInstances'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import type SafeBaseContract from '@safe-global/protocol-kit/dist/src/contracts/Safe/SafeBaseContract'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import { assertValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import type { Eip1193Provider } from 'ethers'
import semver from 'semver'

// `UNKNOWN` is returned if the mastercopy does not match supported ones
// @see https://github.com/safe-global/safe-client-gateway/blob/main/src/routes/safes/handlers/safes.rs#L28-L31
//      https://github.com/safe-global/safe-client-gateway/blob/main/src/routes/safes/converters.rs#L77-L79
export const isValidMasterCopy = (implementationVersionState: SafeInfo['implementationVersionState']): boolean => {
  return implementationVersionState !== ImplementationVersionState.UNKNOWN
}

type ContractProps = {
  safeVersion: SafeVersion
}

export const _getValidatedGetContractProps = (safeVersion: SafeInfo['version']): ContractProps => {
  assertValidSafeVersion(safeVersion)

  // SDK request here: https://github.com/safe-global/safe-core-sdk/issues/261
  // Remove '+L2'/'+Circles' metadata from version
  const [noMetadataVersion] = safeVersion.split('+')

  return {
    safeVersion: noMetadataVersion as SafeVersion,
  }
}

// GnosisSafe

const getGnosisSafeContractEthers = async (safe: SafeInfo, safeProvider: SafeProvider) => {
  return getSafeContractInstance(
    _getValidatedGetContractProps(safe.version).safeVersion,
    safeProvider,
    safe.address.value,
  )
}

export const getReadOnlyCurrentGnosisSafeContract = async (safe: SafeInfo): Promise<SafeBaseContract<any>> => {
  const provider = getWeb3ReadOnly()
  if (!provider) {
    throw new Error('Provider not found')
  }

  const safeProvider = new SafeProvider({ provider: provider._getConnection().url })

  return getGnosisSafeContractEthers(safe, safeProvider)
}

export const getCurrentGnosisSafeContract = async (safe: SafeInfo, provider: Eip1193Provider) => {
  const safeProvider = new SafeProvider({ provider })

  return getGnosisSafeContractEthers(safe, safeProvider)
}

export const getReadOnlyGnosisSafeContract = async (safeVersion: SafeInfo['version'] = LATEST_SAFE_VERSION) => {
  const provider = getWeb3ReadOnly()
  if (!provider) {
    throw new Error('Provider not found')
  }

  const safeProvider = new SafeProvider({ provider: provider._getConnection().url })

  return getSafeContractInstance(_getValidatedGetContractProps(safeVersion).safeVersion, safeProvider)
}

// MultiSend

export const _getMinimumMultiSendCallOnlyVersion = (safeVersion: SafeInfo['version']) => {
  const INITIAL_CALL_ONLY_VERSION = '1.3.0'

  if (!safeVersion) {
    return INITIAL_CALL_ONLY_VERSION
  }

  return semver.gte(safeVersion, INITIAL_CALL_ONLY_VERSION) ? safeVersion : INITIAL_CALL_ONLY_VERSION
}

export const getReadOnlyMultiSendCallOnlyContract = async (safeVersion: SafeInfo['version']) => {
  const provider = getWeb3ReadOnly()
  if (!provider) {
    throw new Error('Provider not found')
  }

  const safeProvider = new SafeProvider({ provider: provider._getConnection().url })

  return getMultiSendCallOnlyContractInstance(_getValidatedGetContractProps(safeVersion).safeVersion, safeProvider)
}

// GnosisSafeProxyFactory

export const getReadOnlyProxyFactoryContract = (safeVersion: SafeInfo['version']) => {
  const provider = getWeb3ReadOnly()
  if (!provider) {
    throw new Error('Provider not found')
  }

  const safeProvider = new SafeProvider({ provider: provider._getConnection().url })

  return getSafeProxyFactoryContractInstance(
    _getValidatedGetContractProps(safeVersion).safeVersion,
    safeProvider,
    provider,
  )
}

// Fallback handler

export const getReadOnlyFallbackHandlerContract = async (safeVersion: SafeInfo['version']) => {
  const provider = getWeb3ReadOnly()
  if (!provider) {
    throw new Error('Provider not found')
  }

  const safeProvider = new SafeProvider({ provider: provider._getConnection().url })

  return getCompatibilityFallbackHandlerContractInstance(
    _getValidatedGetContractProps(safeVersion).safeVersion,
    safeProvider,
  )
}

// Sign messages deployment

export const getReadOnlySignMessageLibContract = async (safeVersion: SafeInfo['version']) => {
  const provider = getWeb3ReadOnly()
  if (!provider) {
    throw new Error('Provider not found')
  }
  const safeProvider = new SafeProvider({ provider: provider._getConnection().url })

  return getSignMessageLibContractInstance(_getValidatedGetContractProps(safeVersion).safeVersion, safeProvider)
}
