import { type ReactElement, type ReactNode, useState, useEffect } from 'react'
import { DialogContent } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { WrongChainWarning } from '../WrongChainWarning'
import { useImmediatelyExecutable, useRecommendedNonce, useValidateNonce } from './hooks'
import ExecuteForm from './ExecuteForm'
import SignForm from './SignForm'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'
import { TxSimulation } from '../TxSimulation'
import { createTx } from '@/services/tx/tx-sender'
import { Errors, logError } from '@/services/exceptions'
import useGasLimit from '@/hooks/useGasLimit'

export type SignOrExecuteProps = {
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

const SignOrExecuteForm = (props: SignOrExecuteProps): ReactElement => {
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const isCreation = !props.txId
  const isNewExecutableTx = useImmediatelyExecutable() && isCreation
  const [tx, setTx] = useState<SafeTransaction | undefined>(props.safeTx)
  const isCorrectNonce = useValidateNonce(tx)

  // Nonce cannot be edited if the tx is already proposed, or signed, or it's a rejection
  const nonceReadonly = !isCreation || !!tx?.signatures.size || !!props.isRejection

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const canExecute = isCorrectNonce && (props.isExecutable || isNewExecutableTx)
  const willExecute = (props.onlyExecute || shouldExecute) && canExecute

  // Recommended nonce and safeTxGas
  const recommendedParams = useRecommendedNonce(tx)
  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(tx)

  const error = props.error || gasLimitError

  const [advancedParams, setAdvancedParams] = useAdvancedParams(
    gasLimit,
    // Initial nonce or a recommended one
    nonceReadonly ? props.safeTx?.data.nonce : recommendedParams?.nonce,
    // Initial safeTxGas or a recommended one
    nonceReadonly ? props.safeTx?.data.safeTxGas : recommendedParams?.safeTxGas,
  )

  // Synchronize the tx with the safeTx
  useEffect(() => setTx(props.safeTx), [props.safeTx])

  // Update the tx when the advancedParams change
  useEffect(() => {
    if (nonceReadonly || !tx?.data) return
    if (tx.data.nonce === advancedParams.nonce && tx.data.safeTxGas === advancedParams.safeTxGas) return

    createTx({ ...tx.data, safeTxGas: advancedParams.safeTxGas }, advancedParams.nonce)
      .then(setTx)
      .catch((err) => logError(Errors._103, (err as Error).message))
  }, [nonceReadonly, tx?.data, advancedParams.nonce, advancedParams.safeTxGas])

  return (
    <DialogContent>
      {props.children}

      <TxSimulation
        canExecute
        gasLimit={advancedParams.gasLimit?.toNumber()}
        transactions={tx}
        disabled={!!gasLimitError}
      />

      <DecodedTx tx={props.safeTx} txId={props.txId} />

      {canExecute && (
        <ExecuteCheckbox checked={shouldExecute} onChange={setShouldExecute} disabled={props.onlyExecute} />
      )}

      <AdvancedParams
        params={advancedParams}
        recommendedGasLimit={gasLimit}
        recommendedNonce={recommendedParams?.nonce}
        willExecute={willExecute}
        nonceReadonly={nonceReadonly}
        onFormSubmit={setAdvancedParams}
        gasLimitError={gasLimitError}
        willRelay={false /* FIXME */}
      />

      {/* Warning message and switch button */}
      <WrongChainWarning />

      {willExecute ? (
        <ExecuteForm {...props} safeTx={tx} advancedParams={advancedParams} error={error} />
      ) : (
        <SignForm {...props} safeTx={tx} error={error} />
      )}
    </DialogContent>
  )
}

export default SignOrExecuteForm
