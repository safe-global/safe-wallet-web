import { type ReactElement, type ReactNode, useState, useContext } from 'react'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { WrongChainWarning } from '../WrongChainWarning'
import { useImmediatelyExecutable, useValidateNonce } from './hooks'
import { TxSimulation } from '../TxSimulation'
import ExecuteForm from './ExecuteForm'
import SignForm from './SignForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box } from '@mui/material'
import ErrorMessage from '../ErrorMessage'

export type SignOrExecuteProps = {
  txId?: string
  onSubmit: () => void // Should go to the success screen onSubmit
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

  return (
    <>
      {props.children}

      <DecodedTx tx={safeTx} txId={props.txId} />

      <TxSimulation canExecute={canExecute} disabled={false} transactions={safeTx} />

      {canExecute && !props.onlyExecute && <ExecuteCheckbox onChange={setShouldExecute} />}

      {/* Warning message and switch button */}
      <WrongChainWarning />

      {safeTxError && (
        <ErrorMessage error={safeTxError}>
          This transaction will most likely fail. To save gas costs, avoid confirming the transaction.
        </ErrorMessage>
      )}

      <Box mt={4}>
        {willExecute ? <ExecuteForm {...props} safeTx={safeTx} /> : <SignForm {...props} safeTx={safeTx} />}
      </Box>
    </>
  )
}

export default SignOrExecuteForm
