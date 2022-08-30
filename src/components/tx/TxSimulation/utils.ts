import type { Web3Provider } from '@ethersproject/providers'
import { FEATURES, type ChainInfo, type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import EthSafeTransaction from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/SafeTransaction'
import { generatePreValidatedSignature } from '@gnosis.pm/safe-core-sdk/dist/src/utils/signatures'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import { hasFeature } from '@/utils/chains'
import { TENDERLY_SIMULATE_ENDPOINT_URL, TENDERLY_ORG_NAME, TENDERLY_PROJECT_NAME } from '@/config/constants'
import { createEthersAdapter, isSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import type { TenderlySimulatePayload, TenderlySimulation } from '@/components/tx/TxSimulation/types'
import { getMultiSendCallOnlyContractInstance } from '@/services/contracts/safeContracts'

export const isTxSimulationEnabled = (chain?: ChainInfo): boolean => {
  if (!chain) {
    return false
  }

  const isSimulationEnvSet =
    Boolean(TENDERLY_SIMULATE_ENDPOINT_URL) && Boolean(TENDERLY_ORG_NAME) && Boolean(TENDERLY_PROJECT_NAME)

  return isSimulationEnvSet && hasFeature(chain, FEATURES.TX_SIMULATION)
}

export const getSimulation = async (tx: TenderlySimulatePayload): Promise<TenderlySimulation> => {
  const data = await fetch(TENDERLY_SIMULATE_ENDPOINT_URL, {
    method: 'POST',
    body: JSON.stringify(tx),
  }).then((res) => res.json())

  return data as TenderlySimulation
}

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/public/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}

export const getSimulationTx = ({
  safe,
  provider,
  canExecute,
  ownerAddress,
  safeTx,
}: {
  safe: SafeInfo
  provider: Web3Provider
  canExecute: boolean
  ownerAddress: string
  safeTx: SafeTransaction
}) => {
  if (!isSafeVersion(safe.version) || !safe.chainId || !safe.address.value) {
    return ''
  }

  const ethAdapter = createEthersAdapter(provider)

  const safeContractInstance = ethAdapter.getSafeContract({
    safeVersion: safe.version,
    chainId: +safe.chainId,
    customContractAddress: safe.address.value,
  })

  const getEncodedSignatures = () => {
    // If a transaction is executable we simulate with the proposed/selected gasLimit and the actual signatures
    if (canExecute) {
      return safeTx.encodedSignatures()
    }

    // Otherwise we overwrite the threshold to 1 on Tenderly and create a signature
    const simulatedTx = new EthSafeTransaction(safeTx.data)
    simulatedTx.addSignature(generatePreValidatedSignature(ownerAddress))

    return simulatedTx.encodedSignatures()
  }

  return safeContractInstance.encode('execTransaction', [
    safeTx.data.to,
    safeTx.data.value,
    safeTx.data.data,
    safeTx.data.operation,
    safeTx.data.safeTxGas,
    safeTx.data.baseGas,
    safeTx.data.gasPrice,
    safeTx.data.gasToken,
    safeTx.data.refundReceiver,
    getEncodedSignatures(),
  ])
}

export const getMultiSendSimulationTx = ({
  chainId,
  multiSendTxData,
}: {
  chainId: string
  multiSendTxData: string
}) => {
  if (!chainId) {
    return ''
  }

  const multiSendContract = getMultiSendCallOnlyContractInstance(chainId)
  return multiSendContract.interface.encodeFunctionData('multiSend', [multiSendTxData])
}
