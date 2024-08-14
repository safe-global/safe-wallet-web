import { createContext, useState, useEffect, useCallback } from 'react'
import type { Dispatch, ReactNode, SetStateAction, ReactElement } from 'react'
import type { MetaTransactionData, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { __unsafe_createMultiSendTx, createTx } from '@/services/tx/tx-sender'
import { useRecommendedNonce, useSafeTxGas } from '../tx/SignOrExecuteForm/hooks'
import { Errors, logError } from '@/services/exceptions'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultiSendCalldata } from '@/utils/transaction-calldata'
import { getSafeContractDeployment } from '@/services/contracts/deployments'
import { decodeMultiSendData } from '@safe-global/protocol-kit/dist/src/utils'
import { useCurrentChain } from '@/hooks/useChains'
import { sameAddress } from '@/utils/addresses'
import { Interface } from 'ethers'
import { isValidMasterCopy } from '@/services/contracts/safeContracts'

export const SafeTxContext = createContext<{
  safeTx?: SafeTransaction
  setSafeTx: Dispatch<SetStateAction<SafeTransaction | undefined>>

  safeMessage?: EIP712TypedData
  setSafeMessage: Dispatch<SetStateAction<EIP712TypedData | undefined>>

  safeTxError?: Error
  setSafeTxError: Dispatch<SetStateAction<Error | undefined>>

  nonce?: number
  setNonce: Dispatch<SetStateAction<number | undefined>>
  nonceNeeded?: boolean
  setNonceNeeded: Dispatch<SetStateAction<boolean>>

  safeTxGas?: string
  setSafeTxGas: Dispatch<SetStateAction<string | undefined>>

  recommendedNonce?: number
}>({
  setSafeTx: () => {},
  setSafeMessage: () => {},
  setSafeTxError: () => {},
  setNonce: () => {},
  setNonceNeeded: () => {},
  setSafeTxGas: () => {},
})

// TODO: Get from safe-deployments once available
const SAFE_TO_L2_MIGRATION_ADDRESS = '0x7Baec386CAF8e02B0BB4AFc98b4F9381EEeE283C'
const SAFE_TO_L2_INTERFACE = new Interface(['function migrateToL2(address l2Singleton)'])

const SafeTxProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [safeTx, setSafeTx] = useState<SafeTransaction>()
  const [safeMessage, setSafeMessage] = useState<EIP712TypedData>()
  const [safeTxError, setSafeTxError] = useState<Error>()
  const [nonce, setNonce] = useState<number>()
  const [nonceNeeded, setNonceNeeded] = useState<boolean>(true)
  const [safeTxGas, setSafeTxGas] = useState<string>()

  const { safe } = useSafeInfo()
  const chain = useCurrentChain()

  const setAndMigrateSafeTx: Dispatch<SetStateAction<SafeTransaction | undefined>> = useCallback(
    (
      value: SafeTransaction | undefined | ((prevState: SafeTransaction | undefined) => SafeTransaction | undefined),
    ) => {
      if (!chain) {
        throw new Error('No Network information available')
      }

      let safeTx: SafeTransaction | undefined
      if (typeof value === 'function') {
        safeTx = value(safeTx)
      } else {
        safeTx = value
      }

      if (
        !safeTx ||
        safeTx.signatures.size > 0 ||
        !chain.l2 ||
        safeTx.data.nonce > 0 ||
        isValidMasterCopy(safe.implementationVersionState)
      ) {
        // We do not migrate on L1s
        // We cannot migrate if the nonce is > 0
        // We do not modify already signed txs
        // We do not modify supported masterCopies
        setSafeTx(safeTx)
        return
      }

      const safeL2Deployment = getSafeContractDeployment(chain, safe.version)
      const safeL2DeploymentAddress = safeL2Deployment?.networkAddresses[chain.chainId]

      if (!safeL2DeploymentAddress) {
        throw new Error('No L2 MasterCopy found')
      }

      if (sameAddress(safe.implementation.value, safeL2DeploymentAddress)) {
        // Safe already has the correct L2 masterCopy
        // This should in theory never happen if the implementationState is valid
        setSafeTx(safeTx)
        return
      }

      // If the Safe is a L1 masterCopy on a L2 network and still has nonce 0, we prepend a call to the migration contract to the safeTx.
      const txData = safeTx.data.data

      let internalTxs: MetaTransactionData[]

      if (isMultiSendCalldata(txData)) {
        // Check if the first tx is already a call to the migration contract
        internalTxs = decodeMultiSendData(txData)
        const firstTx = internalTxs[0]
        if (sameAddress(firstTx?.to, SAFE_TO_L2_MIGRATION_ADDRESS)) {
          // We already migrate. Nothing to do.
          setSafeTx(safeTx)
          return
        }
      } else {
        internalTxs = [{ to: safeTx.data.to, operation: safeTx.data.operation, value: safeTx.data.value, data: txData }]
      }

      // Prepend the migration tx
      const newTxs: MetaTransactionData[] = [
        {
          operation: 1, // DELEGATE CALL REQUIRED
          data: SAFE_TO_L2_INTERFACE.encodeFunctionData('migrateToL2', [safeL2DeploymentAddress]),
          to: SAFE_TO_L2_MIGRATION_ADDRESS,
          value: '0',
        },
        ...internalTxs,
      ]

      __unsafe_createMultiSendTx(newTxs).then(setSafeTx)
    },
    [chain, safe.implementation.value, safe.implementationVersionState, safe.version],
  )

  // Signed txs cannot be updated
  const isSigned = safeTx && safeTx.signatures.size > 0

  // Recommended nonce and safeTxGas
  const recommendedNonce = useRecommendedNonce()
  const recommendedSafeTxGas = useSafeTxGas(safeTx)

  // Priority to external nonce, then to the recommended one
  const finalNonce = isSigned ? safeTx?.data.nonce : nonce ?? recommendedNonce ?? safeTx?.data.nonce
  const finalSafeTxGas = isSigned ? safeTx?.data.safeTxGas : safeTxGas ?? recommendedSafeTxGas ?? safeTx?.data.safeTxGas

  // Update the tx when the nonce or safeTxGas change
  useEffect(() => {
    if (isSigned || !safeTx?.data) return
    if (safeTx.data.nonce === finalNonce && safeTx.data.safeTxGas === finalSafeTxGas) return

    createTx({ ...safeTx.data, safeTxGas: String(finalSafeTxGas) }, finalNonce)
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [isSigned, finalNonce, finalSafeTxGas, safeTx?.data])

  // Log errors
  useEffect(() => {
    safeTxError && logError(Errors._103, safeTxError)
  }, [safeTxError])

  return (
    <SafeTxContext.Provider
      value={{
        safeTx,
        safeTxError,
        setSafeTx: setAndMigrateSafeTx,
        setSafeTxError,
        safeMessage,
        setSafeMessage,
        nonce: finalNonce,
        setNonce,
        nonceNeeded,
        setNonceNeeded,
        safeTxGas: finalSafeTxGas,
        setSafeTxGas,
        recommendedNonce,
      }}
    >
      {children}
    </SafeTxContext.Provider>
  )
}

export default SafeTxProvider
