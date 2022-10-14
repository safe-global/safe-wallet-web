import { type ReactElement, type ReactNode, type SyntheticEvent, useEffect, useState } from 'react'
import { Button, DialogContent, Typography } from '@mui/material'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import {
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxSigning,
  createTx,
  dispatchOnChainSigning,
  dispatchDraftTx,
} from '@/services/tx/txSender'
import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useSafeInfo from '@/hooks/useSafeInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParams, { type AdvancedParameters, useAdvancedParams } from '@/components/tx/AdvancedParams'
import { isSmartContractWallet, shouldUseEthSignMethod } from '@/hooks/wallets/wallets'
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
import SignCheckbox from '../SignCheckbox'

type SignOrExecuteProps = {
  safeTx?: SafeTransaction
  txId?: string
  onSubmit: (txId: string) => void
  children?: ReactNode
  error?: Error
  isExecutable?: boolean
  isRejection?: boolean
  onlyExecute?: boolean
  disableSubmit?: boolean
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
  ...props
}: SignOrExecuteProps): ReactElement => {
  //
  // Hooks & variables
  //
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [shouldSign, setShouldSign] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [tx, setTx] = useState<SafeTransaction | undefined>(safeTx)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isOwner = useIsSafeOwner()
  const provider = useWeb3()
  const currentChain = useCurrentChain()

  // Check that the transaction is executable
  const isNewTx = !txId
  const isNewExecutableTx = isNewTx && safe.threshold === 1
  const isCorrectNonce = tx?.data.nonce === safe.nonce
  const canExecute = isCorrectNonce && (isExecutable || isNewExecutableTx)

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = shouldExecute && shouldSign && canExecute

  // Synchronize the tx with the safeTx
  useEffect(() => setTx(safeTx), [safeTx])

  // Estimate gas limit
  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(willExecute ? tx : undefined)

  const [advancedParams, setAdvancedParams] = useAdvancedParams({
    nonce: tx?.data.nonce,
    gasLimit,
    safeTxGas: tx?.data.safeTxGas,
  })

  // Estimating gas
  const isEstimating = willExecute && gasLimitLoading
  // Nonce cannot be edited if the tx is already signed, or it's a rejection
  const nonceReadonly = !!tx?.signatures.size || isRejection

  // Assert that wallet, tx and provider are defined
  const assertDependencies = (): [ConnectedWallet, SafeTransaction, Web3Provider] => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!tx) throw new Error('Transaction not ready')
    if (!provider) throw new Error('Provider not ready')
    return [wallet, tx, provider]
  }

  // Propose transaction if no txId
  const proposeTx = async (newTx: SafeTransaction): Promise<string> => {
    const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, wallet!.address, newTx, txId)
    return proposedTx.txId
  }

  // Create a draft transaction
  const onDraft = async (): Promise<string> => {
    const [_, createdTx] = assertDependencies()
    const id = await proposeTx(createdTx)
    if (id) await dispatchDraftTx(id)
    return id
  }

  // Sign transaction
  const onSign = async (): Promise<string> => {
    const [connectedWallet, createdTx, provider] = assertDependencies()

    // Smart contract wallets must sign via an on-chain tx
    if (await isSmartContractWallet(connectedWallet)) {
      const id = txId || (await proposeTx(createdTx))
      await dispatchOnChainSigning(createdTx, provider, id)
      return id
    }

    // Otherwise, sign off-chain
    const shouldEthSign = shouldUseEthSignMethod(connectedWallet)
    const signedTx = await dispatchTxSigning(createdTx, shouldEthSign, txId)
    return await proposeTx(signedTx)
  }

  // Execute transaction
  const onExecute = async (): Promise<string> => {
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

    let id: string
    try {
      id = await (willExecute ? onExecute() : shouldSign ? onSign() : onDraft())
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit(id)
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

  const cannotPropose = !isOwner && !onlyExecute // Can't sign or create a tx if not an owner
  const submitDisabled = !isSubmittable || isEstimating || !tx || disableSubmit || isWrongChain || cannotPropose
  const error = props.error || (willExecute && gasLimitError)

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        {children}

        <DecodedTx tx={tx} txId={txId} />

        {/* Draft or signed? */}
        {isNewTx && <SignCheckbox checked={shouldSign} onChange={setShouldSign} />}

        {/* Execute or just sign? */}
        {canExecute && !onlyExecute && shouldSign && (
          <ExecuteCheckbox checked={shouldExecute} onChange={setShouldExecute} />
        )}

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
          transactions={safeTx}
          canExecute={canExecute}
          disabled={submitDisabled}
        />

        {/* Error messages */}
        {isWrongChain && <ErrorMessage>Your wallet is connected to the wrong chain.</ErrorMessage>}

        {cannotPropose && (
          <ErrorMessage>
            You are currently not an owner of this Safe and won&apos;t be able to submit this transaction.
          </ErrorMessage>
        )}

        {error && (
          <ErrorMessage error={error}>
            This transaction will most likely fail. To save gas costs, avoid creating the transaction.
          </ErrorMessage>
        )}

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

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
