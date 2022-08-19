import { ChangeEvent, ReactElement, ReactNode, SyntheticEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { SafeTransaction, TransactionOptions } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Checkbox, DialogContent, FormControlLabel } from '@mui/material'

import { dispatchTxExecution, dispatchTxProposal, dispatchTxSigning, createTx } from '@/services/tx/txSender'
import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useGasPrice from '@/hooks/useGasPrice'
import useSafeInfo from '@/hooks/useSafeInfo'
import GasParams from '@/components/tx/GasParams'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParamsForm, { AdvancedParameters } from '@/components/tx/AdvancedParamsForm'
import { isHardwareWallet } from '@/hooks/wallets/wallets'
import DecodedTx from '../DecodedTx'
import { logError, Errors } from '@/services/exceptions'
import { AppRoutes } from '@/config/routes'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { trackEvent } from '@/services/analytics/analytics'
import { MODALS_EVENTS } from '@/services/analytics/events/modals'

type SignOrExecuteProps = {
  safeTx?: SafeTransaction
  txId?: string
  isExecutable: boolean
  isRejection?: boolean
  onlyExecute?: boolean
  onSubmit: (data: null) => void
  children?: ReactNode
  error?: Error
}

const SignOrExecuteForm = ({
  safeTx,
  txId,
  isExecutable,
  isRejection,
  onlyExecute,
  onSubmit,
  children,
  error,
}: SignOrExecuteProps): ReactElement => {
  //
  // Hooks & variables
  //
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [isEditingGas, setEditingGas] = useState<boolean>(false)
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const [tx, setTx] = useState<SafeTransaction | undefined>(safeTx)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  const router = useRouter()
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const currentChain = useCurrentChain()

  // Check that the transaction is executable
  const canExecute = isExecutable && !!tx && tx.data.nonce === safe.nonce
  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = shouldExecute && canExecute

  // Synchronize the tx with the safeTx
  useEffect(() => setTx(safeTx), [safeTx])

  // Estimate gas limit
  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(willExecute ? tx : undefined)

  // Estimate gas price
  const { maxFeePerGas, maxPriorityFeePerGas, gasPriceLoading } = useGasPrice()

  // Take the manually set gas params or the estimated ones
  const advancedParams: Partial<AdvancedParameters> = {
    nonce: manualParams?.nonce || tx?.data.nonce,
    gasLimit: manualParams?.gasLimit || gasLimit,
    maxFeePerGas: manualParams?.maxFeePerGas || maxFeePerGas,
    maxPriorityFeePerGas: manualParams?.maxPriorityFeePerGas || maxPriorityFeePerGas,
  }

  // Estimating gas limit and price
  const isEstimating = willExecute && (gasLimitLoading || gasPriceLoading)
  // Nonce cannot be edited if the tx is already signed, or it's a rejection
  const nonceReadonly = !!tx?.signatures.size || isRejection

  //
  // Callbacks
  //
  const assertSubmittable = (): [ConnectedWallet, SafeTransaction] => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!tx) throw new Error('Transaction not ready')
    return [wallet, tx]
  }

  // Sign transaction
  const onSign = async (): Promise<string> => {
    const [connectedWallet, createdTx] = assertSubmittable()

    const hardwareWallet = isHardwareWallet(connectedWallet)
    const signedTx = await dispatchTxSigning(createdTx, hardwareWallet, txId)

    const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, connectedWallet.address, signedTx, txId)
    return proposedTx.txId
  }

  // Execute transaction
  const onExecute = async (): Promise<string> => {
    const [connectedWallet, createdTx] = assertSubmittable()

    // If no txId was provided, it's an immediate execution of a new tx
    let id = txId
    if (!id) {
      const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, connectedWallet.address, createdTx)
      id = proposedTx.txId
    }

    const txOptions: TransactionOptions = {
      gasLimit: advancedParams.gasLimit?.toString(),
      maxFeePerGas: advancedParams.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: advancedParams.maxPriorityFeePerGas?.toString(),
    }

    // Some chains don't support EIP-1559 gas price params
    if (currentChain && !hasFeature(currentChain, FEATURES.EIP1559)) {
      txOptions.gasPrice = txOptions.maxFeePerGas
      delete txOptions.maxFeePerGas
      delete txOptions.maxPriorityFeePerGas
    }

    await dispatchTxExecution(id, createdTx, txOptions)

    return id
  }

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    let id: string
    try {
      id = await (willExecute ? onExecute() : onSign())
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit(null)

    // If txId isn't passed in props, it's a newly created tx
    // Redirect to the single tx view
    // @TODO: also don't redirect for Safe Apps transactions (add a new prop)
    if (!txId) {
      router.push({
        pathname: AppRoutes.safe.transactions.tx,
        query: { safe: router.query.safe, id },
      })
    }
  }

  const onAdvancedSubmit = async (data: AdvancedParameters) => {
    // If nonce was edited, create a new with that nonce
    if (tx && data.nonce !== tx.data.nonce) {
      try {
        setTx(await createTx(tx.data, data.nonce))
      } catch (err) {
        logError(Errors._103, (err as Error).message)
        return
      }
    }

    // Close the form and remember the manually set params
    setEditingGas(false)
    setManualParams(data)
  }

  const onExecuteTxCheckbox = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    trackEvent({ ...MODALS_EVENTS.EXECUTE_TX, label: checked })

    setShouldExecute(checked)
  }

  const submitDisabled = !isSubmittable || isEstimating || !tx

  return isEditingGas ? (
    <AdvancedParamsForm
      nonce={advancedParams.nonce || 0}
      gasLimit={advancedParams.gasLimit}
      maxFeePerGas={advancedParams.maxFeePerGas}
      maxPriorityFeePerGas={advancedParams.maxPriorityFeePerGas}
      isExecution={willExecute}
      recommendedNonce={safeTx?.data.nonce}
      estimatedGasLimit={gasLimit?.toString()}
      nonceReadonly={nonceReadonly}
      onSubmit={onAdvancedSubmit}
    />
  ) : (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        {children}

        {tx && <DecodedTx tx={tx} txId={txId} />}

        {canExecute && !onlyExecute && (
          <FormControlLabel
            control={<Checkbox checked={shouldExecute} onChange={onExecuteTxCheckbox} />}
            label="Execute transaction"
            sx={{ mb: 1 }}
          />
        )}

        <GasParams
          isExecution={willExecute}
          isLoading={isEstimating}
          nonce={advancedParams.nonce}
          gasLimit={advancedParams.gasLimit}
          maxFeePerGas={advancedParams.maxFeePerGas}
          maxPriorityFeePerGas={advancedParams.maxPriorityFeePerGas}
          onEdit={() => setEditingGas(true)}
        />

        {(error || (willExecute && gasLimitError)) && (
          <ErrorMessage error={error || gasLimitError}>
            This transaction will most likely fail. To save gas costs, avoid creating the transaction.
          </ErrorMessage>
        )}

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

        <Button variant="contained" type="submit" disabled={submitDisabled}>
          {isEstimating ? 'Estimating...' : 'Submit'}
        </Button>
      </DialogContent>
    </form>
  )
}

export default SignOrExecuteForm
