import { type ReactElement, type ReactNode, type SyntheticEvent, useEffect, useState } from 'react'
import { Button, DialogContent, Typography } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useTxSender from '@/hooks/useTxSender'
import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useSafeInfo from '@/hooks/useSafeInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParams, { type AdvancedParameters, useAdvancedParams } from '@/components/tx/AdvancedParams'
import { isSmartContractWallet } from '@/hooks/wallets/wallets'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { logError, Errors } from '@/services/exceptions'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import { TxSimulation } from '@/components/tx/TxSimulation'
import { useWeb3 } from '@/hooks/wallets/web3'
import type { Web3Provider } from '@ethersproject/providers'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'
import useIsValidExecution from '@/hooks/useIsValidExecution'

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
  onlyExecute,
  onSubmit,
  children,
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

  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isOwner = useIsSafeOwner()
  const provider = useWeb3()
  const currentChain = useCurrentChain()

  const { createTx, dispatchTxProposal, dispatchOnChainSigning, dispatchTxSigning, dispatchTxExecution } = useTxSender()

  // Check that the transaction is executable
  const isNewExecutableTx = !txId && safe.threshold === 1
  const isCorrectNonce = tx?.data.nonce === safe.nonce
  const canExecute = isCorrectNonce && (isExecutable || isNewExecutableTx)

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = shouldExecute && canExecute

  // Synchronize the tx with the safeTx
  useEffect(() => setTx(safeTx), [safeTx])

  // Estimate gas limit
  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(willExecute ? tx : undefined)

  // Check if transaction will fail
  const { executionValidationError, isValidExecutionLoading } = useIsValidExecution(
    willExecute ? tx : undefined,
    gasLimit,
  )

  const [advancedParams, setAdvancedParams] = useAdvancedParams({
    nonce: tx?.data.nonce,
    gasLimit,
    safeTxGas: tx?.data.safeTxGas,
  })

  // Estimating gas
  const isEstimating = willExecute && gasLimitLoading
  // Nonce cannot be edited if the tx is already proposed, or signed, or it's a rejection
  const nonceReadonly = !!txId || !!tx?.signatures.size || isRejection

  // Assert that wallet, tx and provider are defined
  const assertDependencies = (): [ConnectedWallet, SafeTransaction, Web3Provider] => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!tx) throw new Error('Transaction not ready')
    if (!provider) throw new Error('Provider not ready')
    return [wallet, tx, provider]
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

    /**
     * We need to handle this case because of the way useTxSender is designed,
     * but it should never happen here because this function is explicitly called
     * through a user interaction
     */
    if (!proposedTx) {
      throw new Error('Could not propose transaction')
    }

    return proposedTx.txId
  }

  // Sign transaction
  const onSign = async (): Promise<string | undefined> => {
    const [connectedWallet, createdTx, provider] = assertDependencies()

    // Smart contract wallets must sign via an on-chain tx
    if (await isSmartContractWallet(connectedWallet)) {
      // If the first signature is a smart contract wallet, we have to propose w/o signatures
      // Otherwise the backend won't pick up the tx
      // The signature will be added once the on-chain signature is indexed
      const id = txId || (await proposeTx(createdTx))
      await dispatchOnChainSigning(createdTx, provider, id)
      return id
    }

    // Otherwise, sign off-chain
    const signedTx = await dispatchTxSigning(createdTx, safe.version, txId)

    /**
     * We need to handle this case because of the way useTxSender is designed,
     * but it should never happen here because this function is explicitly called
     * through a user interaction
     */
    if (!signedTx) {
      throw new Error('Could not sign transaction')
    }

    return await proposeTx(signedTx)
  }

  // Execute transaction
  const onExecute = async (): Promise<string | undefined> => {
    const [, createdTx, provider] = assertDependencies()

    // If no txId was provided, it's an immediate execution of a new tx
    const id = txId || (await proposeTx(createdTx))
    const txOptions = getTxOptions(advancedParams, currentChain)
    await dispatchTxExecution(createdTx, provider, txOptions, id)

    return id
  }

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await (willExecute ? onExecute() : onSign())
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
    isWrongChain ||
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
        />

        <TxSimulation
          gasLimit={advancedParams.gasLimit?.toNumber()}
          transactions={tx}
          canExecute={canExecute}
          disabled={submitDisabled}
        />

        {/* Error messages */}
        {isWrongChain ? (
          <ErrorMessage>Your wallet is connected to the wrong chain.</ErrorMessage>
        ) : cannotPropose ? (
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
        ) : null}

        {/* Info text */}
        <Typography variant="body2" color="border.main" textAlign="center" mt={3}>
          You&apos;re about to {txId ? '' : 'create and '}
          {willExecute ? 'execute' : 'sign'} a transaction and will need to confirm it with your currently connected
          wallet.
        </Typography>

        {/* Submit button */}
        <Button variant="contained" type="submit" disabled={submitDisabled}>
          {isEstimating ? 'Estimating...' : 'Submit'}
        </Button>
      </DialogContent>
    </form>
  )
}

export default SignOrExecuteForm
