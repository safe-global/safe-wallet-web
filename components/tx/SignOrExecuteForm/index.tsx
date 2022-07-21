import { ReactElement, ReactNode, SyntheticEvent, useEffect, useState } from 'react'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Checkbox, FormControlLabel } from '@mui/material'

import css from './styles.module.css'

import useSafeAddress from '@/hooks/useSafeAddress'
import { useChainId } from '@/hooks/useChainId'
import { createTx, dispatchTxExecution, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useGasPrice from '@/hooks/useGasPrice'
import useSafeInfo from '@/hooks/useSafeInfo'
import GasParams from '@/components/tx/GasParams'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParamsForm, { AdvancedParameters } from '@/components/tx/AdvancedParamsForm'
import { BigNumber } from 'ethers'
import TxModalTitle from '../TxModalTitle'
import { isHardwareWallet } from '@/hooks/wallets/wallets'

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
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [isEditingGas, setEditingGas] = useState<boolean>(false)
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const [tx, setTx] = useState<SafeTransaction | undefined>(safeTx)

  useEffect(() => setTx(safeTx), [safeTx])

  const { safe } = useSafeInfo()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const wallet = useWallet()

  // Check that the transaction is executable
  const canExecute = isExecutable && !!tx && tx.data.nonce === safe?.nonce
  const willExecute = shouldExecute && canExecute
  const recommendedNonce = safeTx?.data.nonce

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

  const onFinish = async (actionFn: () => Promise<void>) => {
    if (!wallet || !tx) return

    setIsSubmittable(false)
    try {
      await actionFn()
    } catch (err) {
      setIsSubmittable(true)
      return
    }
    onSubmit(null)
  }

  const onSign = async () => {
    if (!wallet || !tx) return

    onFinish(async () => {
      const hardwareWallet = isHardwareWallet(wallet)
      const signedTx = await dispatchTxSigning(tx, hardwareWallet, txId)
      await dispatchTxProposal(chainId, safeAddress, wallet.address, signedTx)
    })
  }

  const onExecute = async () => {
    onFinish(async () => {
      let id = txId
      // If no txId was provided, it's an immediate execution of a new tx
      if (!id) {
        const proposedTx = await dispatchTxProposal(chainId, safeAddress, wallet!.address, tx!)
        id = proposedTx.txId
      }

      // @FIXME: pass maxFeePerGas and maxPriorityFeePerGas when Core SDK supports it
      const txOptions = {
        gasLimit: advancedParams.gasLimit?.toString(),
        gasPrice: advancedParams.maxFeePerGas?.toString(),
      }
      await dispatchTxExecution(id, tx!, txOptions)
    })
  }

  const onAdvancedSubmit = async (data: AdvancedParameters) => {
    setEditingGas(false)
    setManualParams(data)

    // Create a new tx with the new nonce
    if (tx && data.nonce !== tx.data.nonce) {
      try {
        const newTx = await createTx({ ...tx.data, nonce: data.nonce })
        setTx(newTx)
      } catch (err) {
        console.error('Could not set new nonce', err)
      }
    }
  }

  const preventDefault = (callback: () => unknown) => {
    return (e: SyntheticEvent) => {
      e.preventDefault()
      callback()
    }
  }

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const isEstimating = willExecute && (gasLimitLoading || gasPriceLoading)
  const handleSubmit = preventDefault(willExecute ? onExecute : onSign)

  return isEditingGas ? (
    <AdvancedParamsForm
      nonce={advancedParams.nonce || 0}
      gasLimit={advancedParams.gasLimit}
      maxFeePerGas={advancedParams.maxFeePerGas || BigNumber.from(0)}
      maxPriorityFeePerGas={advancedParams.maxPriorityFeePerGas || BigNumber.from(0)}
      isExecution={willExecute}
      recommendedNonce={recommendedNonce}
      estimatedGasLimit={gasLimit?.toString()}
      nonceReadonly={!!tx?.signatures.size || isRejection}
      onSubmit={onAdvancedSubmit}
    />
  ) : (
    <div className={css.container}>
      {title && <TxModalTitle>{title}</TxModalTitle>}

      {children}

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
  )
}

export default SignOrExecuteForm
