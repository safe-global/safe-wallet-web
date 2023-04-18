import { type ReactElement, type ReactNode, type SyntheticEvent, useEffect, useState } from 'react'
import { Button, DialogContent, Typography } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useSafeInfo from '@/hooks/useSafeInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParams, { type AdvancedParameters, useAdvancedParams } from '@/components/tx/AdvancedParams'
import { isSmartContractWallet } from '@/hooks/wallets/wallets'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { logError, Errors } from '@/services/exceptions'
import useOnboard, { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions, hasEnoughSignatures } from '@/utils/transactions'
import { TxSimulation } from '@/components/tx/TxSimulation'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'
import useIsValidExecution from '@/hooks/useIsValidExecution'
import { useHasPendingTxs } from '@/hooks/usePendingTxs'
import useWalletCanRelay from '@/hooks/useWalletCanRelay'
import {
  createTx,
  dispatchOnChainSigning,
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxRelay,
  dispatchTxSigning,
} from '@/services/tx/tx-sender'
import CheckWallet from '@/components/common/CheckWallet'
import ExternalLink from '@/components/common/ExternalLink'
import { getExplorerLink } from '@/utils/gateway'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'
import { useRemainingRelaysBySafe } from '@/hooks/useRemainingRelays'
import { type OnboardAPI } from '@web3-onboard/core'
import { WrongChainWarning } from '../WrongChainWarning'

enum ExecutionType {
  RELAYER = 'Via relayer',
  CONNECTED_WALLET = 'With connected wallet',
}

type SignOrExecuteProps = {
  safeTx?: SafeTransaction
  txId?: string
  onSubmit: () => void
  children?: ReactNode
  error?: Error
  isExecutable?: boolean
  isRejection?: boolean
  onlyExecute?: boolean
  disableSubmit?: boolean
  origin?: string
}

const SignOrExecuteForm = ({
  safeTx,
  txId,
  onSubmit,
  children,
  onlyExecute = false,
  isExecutable = false,
  isRejection = false,
  disableSubmit = false,
  origin,
  ...props
}: SignOrExecuteProps): ReactElement => {
  //
  // Hooks & variables
  //
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [tx, setTx] = useState<SafeTransaction | undefined>(safeTx)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const onboard = useOnboard()
  const isOwner = useIsSafeOwner()
  const currentChain = useCurrentChain()
  const hasPending = useHasPendingTxs()
  const [remainingRelays] = useRemainingRelaysBySafe()

  // Unsupported base contract
  const isUnknown = safe.implementationVersionState === ImplementationVersionState.UNKNOWN

  // Check that the transaction is executable
  const isNewExecutableTx = !txId && safe.threshold === 1 && !hasPending
  const isCorrectNonce = tx?.data.nonce === safe.nonce
  const canExecute = isCorrectNonce && (isExecutable || isNewExecutableTx)

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = (onlyExecute || shouldExecute) && canExecute

  // SC wallets can relay fully signed transactions
  const [walletCanRelay] = useWalletCanRelay(tx)

  // The transaction will be executed through relaying
  const willRelay = willExecute && !!remainingRelays && walletCanRelay

  // Synchronize the tx with the safeTx
  useEffect(() => setTx(safeTx), [safeTx])

  // Estimate gas limit
  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(willExecute ? tx : undefined)

  const [advancedParams, setAdvancedParams] = useAdvancedParams({
    nonce: tx?.data.nonce,
    gasLimit,
    safeTxGas: tx?.data.safeTxGas,
  })

  // Check if transaction will fail
  const { executionValidationError, isValidExecutionLoading } = useIsValidExecution(
    willExecute ? tx : undefined,
    advancedParams.gasLimit,
  )

  // Estimating gas
  const isEstimating = willExecute && gasLimitLoading
  // Nonce cannot be edited if the tx is already proposed, or signed, or it's a rejection
  const nonceReadonly = !!txId || !!tx?.signatures.size || isRejection

  // Assert that wallet, tx and provider are defined
  const assertDependencies = (): [ConnectedWallet, SafeTransaction, OnboardAPI] => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!tx) throw new Error('Transaction not ready')
    if (!onboard) throw new Error('Onboard not ready')

    return [wallet, tx, onboard]
  }

  // Propose transaction if no txId
  const proposeTx = async (newTx: SafeTransaction): Promise<string> => {
    const proposedTx = await dispatchTxProposal({
      chainId: safe.chainId,
      safeAddress,
      sender: wallet!.address,
      safeTx: newTx,
      txId,
      origin,
    })

    return proposedTx.txId
  }

  // Sign transaction
  const onSign = async (): Promise<string | undefined> => {
    const [connectedWallet, createdTx, onboard] = assertDependencies()

    // Smart contract wallets must sign via an on-chain tx
    if (await isSmartContractWallet(connectedWallet)) {
      // If the first signature is a smart contract wallet, we have to propose w/o signatures
      // Otherwise the backend won't pick up the tx
      // The signature will be added once the on-chain signature is indexed
      const id = txId || (await proposeTx(createdTx))
      await dispatchOnChainSigning(createdTx, id, onboard, safe.chainId)
      return id
    }

    // Otherwise, sign off-chain
    const signedTx = await dispatchTxSigning(createdTx, safe.version, onboard, safe.chainId, txId)

    return await proposeTx(signedTx)
  }

  // Execute transaction
  const onExecute = async (): Promise<string | undefined> => {
    const [, createdTx, onboard] = assertDependencies()

    // If no txId was provided, it's an immediate execution of a new tx
    const id = txId || (await proposeTx(createdTx))
    const txOptions = getTxOptions(advancedParams, currentChain)
    trackEvent({ ...MODALS_EVENTS.PROPOSE_TX, label: ExecutionType.CONNECTED_WALLET })
    await dispatchTxExecution(createdTx, txOptions, id, onboard, safe.chainId, safeAddress)

    return id
  }

  const onRelay = async () => {
    const [, createdTx, onboard] = assertDependencies()

    const { gasLimit } = getTxOptions(advancedParams, currentChain)

    let id = txId
    let safeTx = createdTx
    // Add missing signature
    if (!hasEnoughSignatures(createdTx, safe)) {
      const signedTransaction = await dispatchTxSigning(createdTx, safe.version, onboard, safe.chainId, txId)

      if (!signedTransaction) {
        throw new Error('Could not sign transaction')
      }

      id = await proposeTx(signedTransaction)
      safeTx = signedTransaction
    }

    if (!id) {
      throw new Error('Transaction could not be proposed')
    }

    trackEvent({ ...MODALS_EVENTS.PROPOSE_TX, label: ExecutionType.RELAYER })
    dispatchTxRelay(safeTx, safe, id, gasLimit)
  }

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await (willRelay ? onRelay() : willExecute ? onExecute() : onSign())
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit()
  }

  // On advanced params submit (nonce, gas limit, price, etc)
  const onAdvancedSubmit = async (data: AdvancedParameters) => {
    // If nonce was edited, create a new tx with that nonce
    if (tx && (data.nonce !== tx.data.nonce || data.safeTxGas !== tx.data.safeTxGas)) {
      try {
        setTx(await createTx({ ...tx.data, safeTxGas: data.safeTxGas }, data.nonce))
      } catch (err) {
        logError(Errors._103, (err as Error).message)
        return
      }
    }

    setAdvancedParams(data)
  }

  const isExecutionLoop = wallet ? sameString(wallet.address, safeAddress) : false // Can't execute own transaction
  const cannotPropose = !isOwner && !onlyExecute // Can't sign or create a tx if not an owner
  const submitDisabled =
    !isSubmittable ||
    isEstimating ||
    !tx ||
    disableSubmit ||
    cannotPropose ||
    isExecutionLoop ||
    isValidExecutionLoading

  const error = props.error || (willExecute ? gasLimitError || executionValidationError : undefined)

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        {children}

        <DecodedTx tx={tx} txId={txId} />

        {canExecute && <ExecuteCheckbox checked={shouldExecute} onChange={setShouldExecute} disabled={onlyExecute} />}

        <AdvancedParams
          params={advancedParams}
          recommendedGasLimit={gasLimit}
          recommendedNonce={safeTx?.data.nonce}
          willExecute={willExecute}
          nonceReadonly={nonceReadonly}
          onFormSubmit={onAdvancedSubmit}
          gasLimitError={gasLimitError}
          willRelay={willRelay}
        />

        <TxSimulation
          gasLimit={advancedParams.gasLimit?.toNumber()}
          transactions={tx}
          canExecute={canExecute}
          disabled={submitDisabled}
        />

        {/* Warning message and switch button */}
        <WrongChainWarning />

        {/* Error messages */}
        {isSubmittable && cannotPropose ? (
          <ErrorMessage>
            You are currently not an owner of this Safe and won&apos;t be able to submit this transaction.
          </ErrorMessage>
        ) : isExecutionLoop ? (
          <ErrorMessage>
            Cannot execute a transaction from the Safe itself, please connect a different account.
          </ErrorMessage>
        ) : error ? (
          <ErrorMessage error={error}>
            This transaction will most likely fail.{' '}
            {isNewExecutableTx
              ? 'To save gas costs, avoid creating the transaction.'
              : 'To save gas costs, reject this transaction.'}
          </ErrorMessage>
        ) : submitError ? (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        ) : willExecute && isUnknown ? (
          <ErrorMessage>
            This Safe was created with an unsupported base contract. It should <b>ONLY</b> be used for fund recovery.
            Transactions will execute but the transaction list may not immediately update. Transaction success can be
            verified on the{' '}
            <ExternalLink
              href={currentChain ? getExplorerLink(safeAddress, currentChain.blockExplorerUriTemplate).href : ''}
            >
              {currentChain?.chainName} explorer
            </ExternalLink>
            .
          </ErrorMessage>
        ) : null}

        {/* Info text */}
        <Typography variant="body2" color="border.main" textAlign="center" mt={3}>
          You&apos;re about to {txId ? '' : 'create and '}
          {willExecute ? 'execute' : 'sign'} a transaction and will need to confirm it with your currently connected
          wallet.
        </Typography>

        {/* Submit button */}
        <CheckWallet allowNonOwner={willExecute}>
          {(isOk) => (
            <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
              {isEstimating ? 'Estimating...' : 'Submit'}
            </Button>
          )}
        </CheckWallet>
      </DialogContent>
    </form>
  )
}

export default SignOrExecuteForm
