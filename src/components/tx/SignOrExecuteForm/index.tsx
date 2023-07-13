import { type ReactElement, type ReactNode, useState, useContext } from 'react'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { WrongChainWarning } from '../WrongChainWarning'
import { useImmediatelyExecutable, useValidateNonce } from './hooks'
import ExecuteForm from './ExecuteForm'
import SignForm from './SignForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import ErrorMessage from '../ErrorMessage'
import TxChecks from './TxChecks'
import TxCard from '@/components/tx-flow/common/TxCard'
import ConfirmationTitle, { ConfirmationTitleTypes } from '@/components/tx/SignOrExecuteForm/ConfirmationTitle'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { RedefineBalanceChanges } from '../security/redefine/RedefineBalanceChange'
import UnknownContractError from './UnknownContractError'
import RiskConfirmationError from './RiskConfirmationError'
import useDecodeTx, { isMultisendTx } from '@/hooks/useDecodeTx'
import { ErrorBoundary } from '@sentry/react'
import ApprovalEditor from '../ApprovalEditor'

export type SignOrExecuteProps = {
  txId?: string
  onSubmit: () => void
  children?: ReactNode
  isExecutable?: boolean
  isRejection?: boolean
  isBatch?: boolean
  onlyExecute?: boolean
  disableSubmit?: boolean
  origin?: string
}

const SignOrExecuteForm = (props: SignOrExecuteProps): ReactElement => {
  const { transactionExecution } = useAppSelector(selectSettings)
  const [shouldExecute, setShouldExecute] = useState<boolean>(transactionExecution)
  const { safeTx, safeTxError } = useContext(SafeTxContext)
  const isCreation = safeTx?.signatures.size === 0
  const isNewExecutableTx = useImmediatelyExecutable() && isCreation
  const isCorrectNonce = useValidateNonce(safeTx)
  const decodedTx = useDecodeTx(safeTx)
  const isMultisend = props.isBatch || isMultisendTx(decodedTx[0])

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const canExecute = isCorrectNonce && (props.isExecutable || isNewExecutableTx)
  const willExecute = (props.onlyExecute || shouldExecute) && canExecute

  return (
    <>
      <TxCard>
        {props.children}

        <ErrorBoundary fallback={<div>Error parsing data</div>}>
          <ApprovalEditor safeTransaction={safeTx} />
        </ErrorBoundary>

        <DecodedTx
          tx={safeTx}
          txId={props.txId}
          decodedData={decodedTx[0]}
          decodedDataError={decodedTx[1]}
          decodedDataLoading={decodedTx[2]}
        />

        <RedefineBalanceChanges />
      </TxCard>

      <TxCard>
        <TxChecks />
      </TxCard>

      <TxCard>
        <ConfirmationTitle
          variant={willExecute ? ConfirmationTitleTypes.execute : ConfirmationTitleTypes.sign}
          isCreation={isCreation}
        />

        {safeTxError && (
          <ErrorMessage error={safeTxError}>
            This transaction will most likely fail. To save gas costs, avoid confirming the transaction.
          </ErrorMessage>
        )}

        {canExecute && !props.onlyExecute && <ExecuteCheckbox onChange={setShouldExecute} />}

        <WrongChainWarning />

        <UnknownContractError />

        <RiskConfirmationError />

        {willExecute ? (
          <ExecuteForm {...props} safeTx={safeTx} />
        ) : (
          <SignForm {...props} safeTx={safeTx} isBatch={isMultisend} />
        )}
      </TxCard>
    </>
  )
}

export default SignOrExecuteForm
