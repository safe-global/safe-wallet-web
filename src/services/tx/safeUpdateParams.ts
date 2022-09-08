import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types'
import { ChainInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  _getSafeContractDeployment,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { isValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { ethers } from 'ethers'
import semverSatisfies from 'semver/functions/satisfies'

export const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'
export const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

const buildTransaction = (safe: SafeInfo, data: string) => ({
  to: safe.address.value,
  data,
  value: '0',
  operation: OperationType.Call,
})

const getChangeMasterCopyTransaction = (
  safe: SafeInfo,
  chain: ChainInfo,
  safeContractInterface: ethers.utils.Interface,
) => {
  const latestMasterCopyAddress = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION).getAddress()
  const changeMasterCopyCallData = safeContractInterface.encodeFunctionData('changeMasterCopy', [
    latestMasterCopyAddress,
  ])

  return buildTransaction(safe, changeMasterCopyCallData)
}

const getSetFallbackHandlerTransaction = (
  safe: SafeInfo,
  chain: ChainInfo,
  safeContractInterface: ethers.utils.Interface,
) => {
  const fallbackHandlerContractAddress = getFallbackHandlerContractInstance(chain.chainId).address
  const setFallbackHandlerCallData = safeContractInterface.encodeFunctionData('setFallbackHandler', [
    fallbackHandlerContractAddress,
  ])

  return buildTransaction(safe, setFallbackHandlerCallData)
}

const getContractInterface = (chain: ChainInfo, version: string) => {
  if (isValidSafeVersion(version)) {
    return getGnosisSafeContractInstance(chain, version).contract.interface
  }

  // < 1.1.1 Safes are not supported by Core SDK. We must connect to the contract directly

  const safeDeployment = _getSafeContractDeployment(chain, version)
  const contractAddress = safeDeployment?.networkAddresses[chain.chainId]

  if (!contractAddress) {
    throw new Error(`GnosisSafe contract not found for chainId: ${chain.chainId}`)
  }

  return new ethers.Contract(contractAddress, safeDeployment.abi).interface
}

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (safe: SafeInfo, chain: ChainInfo): MetaTransactionData[] => {
  const safeContractInterface = getContractInterface(chain, safe.version)

  const changeMasterCopyTx = getChangeMasterCopyTransaction(safe, chain, safeContractInterface)

  const hasSetFallbackHandler = semverSatisfies(safe.version, '>=1.1.0')

  if (!hasSetFallbackHandler) {
    return [changeMasterCopyTx]
  }

  const setFallbackHandlerTx = getSetFallbackHandlerTransaction(safe, chain, safeContractInterface)

  return [changeMasterCopyTx, setFallbackHandlerTx]
}
