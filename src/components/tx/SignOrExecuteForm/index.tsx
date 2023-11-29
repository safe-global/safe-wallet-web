import { type ReactElement, type ReactNode, useState, useContext, useCallback } from 'react'
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
import useDecodeTx from '@/hooks/useDecodeTx'
import { ErrorBoundary } from '@sentry/react'
import ApprovalEditor from '../ApprovalEditor'
import { isDelegateCall } from '@/services/tx/tx-sender/sdk'
import useChainId from '@/hooks/useChainId'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'

export type SubmitCallback = (txId: string, isExecuted?: boolean) => void

export type SignOrExecuteProps = {
  txId?: string
  onSubmit?: SubmitCallback
  children?: ReactNode
  isExecutable?: boolean
  isRejection?: boolean
  isBatch?: boolean
  isBatchable?: boolean
  onlyExecute?: boolean
  disableSubmit?: boolean
  origin?: string
  isCreation?: boolean
}

const SignOrExecuteForm = ({ onSubmit, ...props }: SignOrExecuteProps): ReactElement => {
  const chainId = useChainId()
  const { transactionExecution } = useAppSelector(selectSettings)
  const [shouldExecute, setShouldExecute] = useState<boolean>(transactionExecution)
  const { safeTx, safeTxError } = useContext(SafeTxContext)
  const isCreation = !props.txId
  const isNewExecutableTx = useImmediatelyExecutable() && isCreation
  const isCorrectNonce = useValidateNonce(safeTx)
  const [decodedData, decodedDataError, decodedDataLoading] = useDecodeTx(safeTx)
  const isBatchable = props.isBatchable !== false && safeTx && !isDelegateCall(safeTx)

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const canExecute = isCorrectNonce && (props.isExecutable || isNewExecutableTx)
  const willExecute = (props.onlyExecute || shouldExecute) && canExecute

  const onFormSubmit = useCallback<SubmitCallback>(
    async (txId, isExecuted) => {
      // Track tx event
      const event = isExecuted ? TX_EVENTS.EXECUTE : isCreation ? TX_EVENTS.CREATE : TX_EVENTS.CONFIRM
      const txType = await getTransactionTrackingType(txId, chainId)
      trackEvent({ ...event, label: txType })

      onSubmit?.(txId, isExecuted)
    },
    [chainId, isCreation, onSubmit],
  )

  return (
    <>
      <TxCard>
        {props.children}

        {!isCreation && (
          <ErrorBoundary fallback={<div>Error parsing data</div>}>
            <ApprovalEditor safeTransaction={safeTx} />
          </ErrorBoundary>
        )}

        <DecodedTx
          tx={safeTx}
          txId={props.txId}
          decodedData={decodedData}
          decodedDataError={decodedDataError}
          decodedDataLoading={decodedDataLoading}
          showMultisend={!props.isBatch}
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
          <ExecuteForm {...props} safeTx={safeTx} isCreation={isCreation} onSubmit={onFormSubmit} />
        ) : (
          <SignForm
            {...props}
            safeTx={safeTx}
            isBatchable={isBatchable}
            isCreation={isCreation}
            onSubmit={onFormSubmit}
          />
        )}
      </TxCard>
    </>
  )
}

export default SignOrExecuteForm
