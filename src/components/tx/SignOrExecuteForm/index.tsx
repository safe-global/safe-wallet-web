import { type ReactElement, type ReactNode, useState, useContext } from 'react'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { WrongChainWarning } from '../WrongChainWarning'
import { useImmediatelyExecutable, useValidateNonce } from './hooks'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'
import { TxSimulation } from '../TxSimulation'
import useGasLimit from '@/hooks/useGasLimit'
import ExecuteForm from './ExecuteForm'
import SignForm from './SignForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box } from '@mui/material'

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

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(safeTx)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  // Error
  const error = safeTxError || gasLimitError

  return (
    <>
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

      <Box mt={4}>
        {willExecute ? (
          <ExecuteForm {...props} safeTx={safeTx} error={error} advancedParams={advancedParams} />
        ) : (
          <SignForm {...props} safeTx={safeTx} error={error} />
        )}
      </Box>
    </>
  )
}

export default SignOrExecuteForm
