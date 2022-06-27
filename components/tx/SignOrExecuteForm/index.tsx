import { ReactElement, ReactNode, SyntheticEvent, useState } from 'react'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Checkbox, FormControlLabel, Typography } from '@mui/material'

import css from './styles.module.css'

import useSafeAddress from '@/services/useSafeAddress'
import { useChainId } from '@/services/useChainId'
import { dispatchTxExecution, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useWallet from '@/services/wallets/useWallet'
import useGasLimit from '@/services/useGasLimit'
import useGasPrice from '@/services/useGasPrice'
import useSafeInfo from '@/services/useSafeInfo'
import GasParams from '@/components/tx/GasParams'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParamsForm, { AdvancedParameters } from '@/components/tx/AdvancedParamsForm'

type SignOrExecuteProps = {
  safeTx?: SafeTransaction
  txId?: string
  isExecutable: boolean
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
  onlyExecute,
  onSubmit,
  children,
  error,
  title,
}: SignOrExecuteProps): ReactElement => {
  const { safe } = useSafeInfo()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const wallet = useWallet()

  // Check that the transaction is executable
  const canExecute = isExecutable && !!safeTx && safeTx.data.nonce === safe?.nonce

  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [isEditingGas, setEditingGas] = useState<boolean>(false)
  const [manualParams, setManualParams] = useState<AdvancedParameters>()

  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(
    shouldExecute && safeTx && wallet
      ? {
          ...safeTx.data,
          from: wallet.address,
        }
      : undefined,
  )

  const { maxFeePerGas, maxPriorityFeePerGas, gasPriceLoading } = useGasPrice()

  // Manually set gas params or the estimated ones
  const advancedParams: Partial<AdvancedParameters> = {
    gasLimit: manualParams?.gasLimit || gasLimit,
    maxFeePerGas: manualParams?.maxFeePerGas || maxFeePerGas,
    maxPriorityFeePerGas: manualParams?.maxPriorityFeePerGas || maxPriorityFeePerGas,
  }

  const onFinish = async (actionFn: () => Promise<void>) => {
    if (!wallet || !safeTx) return

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
    onFinish(async () => {
      const signedTx = await dispatchTxSigning(safeTx!, txId)
      await dispatchTxProposal(chainId, safeAddress, wallet!.address, signedTx)
    })
  }

  const onExecute = async () => {
    onFinish(async () => {
      let id = txId
      // If no txId was provided, it's an immediate execution of a new tx
      if (!id) {
        const proposedTx = await dispatchTxProposal(chainId, safeAddress, wallet!.address, safeTx!)
        id = proposedTx.txId
      }

      // @FIXME: pass maxFeePerGas and maxPriorityFeePerGas when Core SDK supports it
      await dispatchTxExecution(id, safeTx!, {
        gasLimit: advancedParams.gasLimit,
        gasPrice: advancedParams.maxFeePerGas?.toString(),
      })
    })
  }

  const onGasSubmit = (data: AdvancedParameters) => {
    setEditingGas(false)
    setManualParams(data)
  }

  const preventDefault = (callback: () => unknown) => {
    return (e: SyntheticEvent) => {
      e.preventDefault()
      callback()
    }
  }

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = shouldExecute && canExecute
  const isEstimating = willExecute && (gasLimitLoading || gasPriceLoading)
  const handleSubmit = preventDefault(willExecute ? onExecute : onSign)

  return isEditingGas ? (
    isEstimating ? (
      <></>
    ) : (
      <AdvancedParamsForm
        gasLimit={advancedParams.gasLimit!}
        maxFeePerGas={advancedParams.maxFeePerGas!}
        maxPriorityFeePerGas={advancedParams.maxPriorityFeePerGas!}
        onSubmit={onGasSubmit}
      />
    )
  ) : (
    <div className={css.container}>
      {title && <Typography variant="h6">{title}</Typography>}

      {children}

      <form onSubmit={handleSubmit}>
        {canExecute && !onlyExecute && (
          <FormControlLabel
            control={<Checkbox checked={shouldExecute} onChange={(e) => setShouldExecute(e.target.checked)} />}
            label="Execute Transaction"
          />
        )}

        {willExecute && (
          <GasParams
            isLoading={isEstimating}
            gasLimit={advancedParams.gasLimit}
            maxFeePerGas={advancedParams.maxFeePerGas}
            maxPriorityFeePerGas={advancedParams.maxPriorityFeePerGas}
            onEdit={() => setEditingGas(true)}
          />
        )}

        {(gasLimitError || error) && (
          <ErrorMessage>
            This transaction will most likely fail. To save gas costs, avoid creating the transaction.
            <p>{(gasLimitError || error)?.message}</p>
          </ErrorMessage>
        )}

        <div className={css.submit}>
          <Button variant="contained" type="submit" disabled={!isSubmittable || isEstimating}>
            {isEstimating ? 'Estimating...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SignOrExecuteForm
