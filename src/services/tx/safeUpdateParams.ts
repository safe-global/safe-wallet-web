import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types'
import { ChainInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  _getSafeContractDeployment,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { isValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { Gnosis_safe__factory } from '@/types/contracts/factories/Gnosis_safe__factory'
import { getWeb3 } from '@/hooks/wallets/web3'

export const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'
export const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

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

  const web3 = getWeb3()

  if (!web3) {
    throw new Error('No provider instance found')
  }

  return Gnosis_safe__factory.connect(contractAddress, web3).interface
}

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (safe: SafeInfo, chain: ChainInfo): MetaTransactionData[] => {
  const latestMasterCopy = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION)
  const safeContractInterface = getContractInterface(chain, safe.version)

  // @ts-expect-error this was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = safeContractInterface.encodeFunctionData('changeMasterCopy', [
    latestMasterCopy.getAddress(),
  ])

  const fallbackHandlerAddress = getFallbackHandlerContractInstance(chain.chainId).address
  const changeFallbackHandlerCallData = safeContractInterface.encodeFunctionData('setFallbackHandler', [
    fallbackHandlerAddress,
  ])

  const txs: MetaTransactionData[] = [
    {
      to: safe.address.value,
      value: '0',
      data: changeMasterCopyCallData,
      operation: OperationType.Call,
    },
    {
      to: safe.address.value,
      value: '0',
      data: changeFallbackHandlerCallData,
      operation: OperationType.Call,
    },
  ]

  return txs
}
