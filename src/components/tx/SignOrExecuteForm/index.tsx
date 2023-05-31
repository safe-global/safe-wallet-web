import { type ReactElement, type ReactNode, useState, useContext } from 'react'
import { DialogContent } from '@mui/material'

import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { WrongChainWarning } from '../WrongChainWarning'
import { useImmediatelyExecutable, useValidateNonce } from './hooks'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'
import { TxSimulation } from '../TxSimulation'
import useGasLimit from '@/hooks/useGasLimit'
import { SafeTxContext } from '@/components/TxFlow/SafeTxProvider'
import ExecuteForm from './ExecuteForm'
import SignForm from './SignForm'

export type SignOrExecuteProps = {
  txId?: string
  onSubmit: () => void
  children?: ReactNode
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
  const { safeTx, safeTxError } = useContext(SafeTxContext)
  const isCorrectNonce = useValidateNonce(safeTx)

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const canExecute = isCorrectNonce && (props.isExecutable || isNewExecutableTx)
  const willExecute = (props.onlyExecute || shouldExecute) && canExecute

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(safeTx)

  const error = safeTxError || gasLimitError

  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  return (
    <DialogContent>
      {props.children}

      <TxSimulation
        canExecute
        gasLimit={advancedParams.gasLimit?.toNumber()}
        transactions={safeTx}
        disabled={!!gasLimitError}
      />

      <DecodedTx tx={safeTx} txId={props.txId} />

      {canExecute && (
        <ExecuteCheckbox checked={shouldExecute} onChange={setShouldExecute} disabled={props.onlyExecute} />
      )}

      {/* Warning message and switch button */}
      <WrongChainWarning />

      {willExecute && (
        <AdvancedParams
          params={advancedParams}
          recommendedGasLimit={gasLimit}
          willExecute={willExecute}
          onFormSubmit={setAdvancedParams}
          gasLimitError={gasLimitError}
          willRelay={false /* FIXME */}
        />
      )}

      {willExecute ? (
        <ExecuteForm {...props} safeTx={safeTx} error={error} advancedParams={advancedParams} />
      ) : (
        <SignForm {...props} safeTx={safeTx} error={error} />
      )}
    </DialogContent>
  )
}

export default SignOrExecuteForm
