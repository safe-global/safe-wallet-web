import { ReactElement, ReactNode, SyntheticEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Checkbox, FormControlLabel } from '@mui/material'

import css from './styles.module.css'

import { dispatchTxExecution, dispatchTxProposal, dispatchTxSigning, updateTxNonce } from '@/services/tx/txSender'
import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useGasPrice from '@/hooks/useGasPrice'
import useSafeInfo from '@/hooks/useSafeInfo'
import GasParams from '@/components/tx/GasParams'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParamsForm, { AdvancedParameters } from '@/components/tx/AdvancedParamsForm'
import TxModalTitle from '../TxModalTitle'
import { isHardwareWallet } from '@/hooks/wallets/wallets'
import DecodedTx from '../DecodedTx'
import { logError, Errors } from '@/services/exceptions'
import { AppRoutes } from '@/config/routes'

type SignOrExecuteProps = {
  safeTx?: SafeTransaction
  txId?: string
  isExecutable: boolean
  isRejection?: boolean
  onlyExecute?: boolean
  onSubmit: (data: null) => void
  children?: ReactNode
  error?: Error
  title?: string
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
  title,
}: SignOrExecuteProps): ReactElement => {
  //
  // Hooks & variables
  //
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [isEditingGas, setEditingGas] = useState<boolean>(false)
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const [tx, setTx] = useState<SafeTransaction | undefined>(safeTx)

  const router = useRouter()
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()

  // Check that the transaction is executable
  const canExecute = isExecutable && !!tx && tx.data.nonce === safe.nonce
  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = shouldExecute && canExecute

  // Syncronize the tx with the safeTx
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

  // Sign transaction
  const onSign = async (): Promise<string> => {
    if (!wallet || !tx) throw new Error('Cannot sign')

    const hardwareWallet = isHardwareWallet(wallet)
    const signedTx = await dispatchTxSigning(tx, hardwareWallet, txId)

    const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, wallet.address, signedTx)
    return proposedTx.txId
  }

  // Execute transaction
  const onExecute = async (): Promise<string> => {
    if (!wallet || !tx) throw new Error('Cannot execute')

    // If no txId was provided, it's an immediate execution of a new tx
    let id = txId
    if (!id) {
      const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, wallet.address, tx)
      id = proposedTx.txId
    }

    // @FIXME: pass maxFeePerGas and maxPriorityFeePerGas when Core SDK supports it
    const txOptions = {
      gasLimit: advancedParams.gasLimit?.toString(),
      gasPrice: advancedParams.maxFeePerGas?.toString(),
    }
    await dispatchTxExecution(id, tx, txOptions)

    return id
  }

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)

    let id: string
    try {
      id = await (willExecute ? onExecute() : onSign())
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
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
        setTx(await updateTxNonce(tx, data.nonce))
      } catch (err) {
        logError(Errors._103, (err as Error).message)
        return
      }
    }

    // Close the form and remember the manually set params
    setEditingGas(false)
    setManualParams(data)
  }

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
    <>
      {title && <TxModalTitle>{title}</TxModalTitle>}
      <div className={css.container}>
        {children}

        <DecodedTx tx={tx} />

        <form onSubmit={handleSubmit}>
          {canExecute && !onlyExecute && (
            <FormControlLabel
              control={<Checkbox checked={shouldExecute} onChange={(e) => setShouldExecute(e.target.checked)} />}
              label="Execute transaction"
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

          <Button variant="contained" type="submit" disabled={!isSubmittable || isEstimating}>
            {isEstimating ? 'Estimating...' : 'Submit'}
          </Button>
        </form>
      </div>
    </>
  )
}

export default SignOrExecuteForm
