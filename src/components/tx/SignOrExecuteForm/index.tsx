import DelegateForm from '@/components/tx/SignOrExecuteForm/DelegateForm'
import CounterfactualForm from '@/features/counterfactual/CounterfactualForm'
import { useIsWalletDelegate } from '@/hooks/useDelegates'
import useSafeInfo from '@/hooks/useSafeInfo'
import { type ReactElement, type ReactNode, useState, useContext, useCallback } from 'react'
import madProps from '@/utils/mad-props'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
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
import UnknownContractError from './UnknownContractError'
import useDecodeTx from '@/hooks/useDecodeTx'
import { ErrorBoundary } from '@sentry/react'
import ApprovalEditor from '../ApprovalEditor'
import { isDelegateCall } from '@/services/tx/tx-sender/sdk'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import useChainId from '@/hooks/useChainId'
import ExecuteThroughRoleForm from './ExecuteThroughRoleForm'
import { findAllowingRole, findMostLikelyRole, useRoles } from './ExecuteThroughRoleForm/hooks'
import { isAnyStakingTxInfo, isCustomTxInfo, isGenericConfirmation, isOrderTxInfo } from '@/utils/transaction-guards'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { BlockaidBalanceChanges } from '../security/blockaid/BlockaidBalanceChange'
import { Blockaid } from '../security/blockaid'

import TxData from '@/components/transactions/TxDetails/TxData'
import ConfirmationOrder from '@/components/tx/ConfirmationOrder'
import { useApprovalInfos } from '../ApprovalEditor/hooks/useApprovalInfos'

import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { useGetTransactionDetailsQuery, useLazyGetTransactionDetailsQuery } from '@/store/gateway'
import { skipToken } from '@reduxjs/toolkit/query/react'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'

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
  showMethodCall?: boolean
}

const trackTxEvents = (
  details: TransactionDetails | undefined,
  isCreation: boolean,
  isExecuted: boolean,
  isRoleExecution: boolean,
  isDelegateCreation: boolean,
) => {
  const creationEvent = isRoleExecution
    ? TX_EVENTS.CREATE_VIA_ROLE
    : isDelegateCreation
    ? TX_EVENTS.CREATE_VIA_DELEGATE
    : TX_EVENTS.CREATE
  const executionEvent = isRoleExecution ? TX_EVENTS.EXECUTE_VIA_ROLE : TX_EVENTS.EXECUTE
  const event = isCreation ? creationEvent : isExecuted ? executionEvent : TX_EVENTS.CONFIRM
  const txType = getTransactionTrackingType(details)
  trackEvent({ ...event, label: txType })

  // Immediate execution on creation
  if (isCreation && isExecuted) {
    trackEvent({ ...executionEvent, label: txType })
  }
}

export const SignOrExecuteForm = ({
  chainId,
  safeTx,
  safeTxError,
  onSubmit,
  ...props
}: SignOrExecuteProps & {
  chainId: ReturnType<typeof useChainId>
  safeTx: ReturnType<typeof useSafeTx>
  safeTxError: ReturnType<typeof useSafeTxError>
}): ReactElement => {
  const { transactionExecution } = useAppSelector(selectSettings)
  const [shouldExecute, setShouldExecute] = useState<boolean>(transactionExecution)
  const isCreation = !props.txId
  const isNewExecutableTx = useImmediatelyExecutable() && isCreation
  const isCorrectNonce = useValidateNonce(safeTx)
  const [decodedData] = useDecodeTx(safeTx)

  const isBatchable = props.isBatchable !== false && safeTx && !isDelegateCall(safeTx)

  const { data: txDetails } = useGetTransactionDetailsQuery(
    chainId && props.txId
      ? {
          chainId,
          txId: props.txId,
        }
      : skipToken,
  )
  const showTxDetails =
    props.txId &&
    txDetails &&
    !isCustomTxInfo(txDetails.txInfo) &&
    !isAnyStakingTxInfo(txDetails.txInfo) &&
    !isOrderTxInfo(txDetails.txInfo)
  const isDelegate = useIsWalletDelegate()
  const [trigger] = useLazyGetTransactionDetailsQuery()
  const [readableApprovals] = useApprovalInfos({ safeTransaction: safeTx })
  const isApproval = readableApprovals && readableApprovals.length > 0

  const { safe } = useSafeInfo()
  const isSafeOwner = useIsSafeOwner()
  const isCounterfactualSafe = !safe.deployed

  // Check if a Zodiac Roles mod is enabled and if the user is a member of any role that allows the transaction
  const roles = useRoles(
    !isCounterfactualSafe && isCreation && !(isNewExecutableTx && isSafeOwner) ? safeTx : undefined,
  )
  const allowingRole = findAllowingRole(roles)
  const mostLikelyRole = findMostLikelyRole(roles)
  const canExecuteThroughRole = !!allowingRole || (!!mostLikelyRole && !isSafeOwner)
  const preferThroughRole = canExecuteThroughRole && !isSafeOwner // execute through role if a non-owner role member wallet is connected

  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const canExecute = isCorrectNonce && (props.isExecutable || isNewExecutableTx)
  const willExecute = (props.onlyExecute || shouldExecute) && canExecute && !preferThroughRole
  const willExecuteThroughRole =
    (props.onlyExecute || shouldExecute) && canExecuteThroughRole && (!canExecute || preferThroughRole)

  const onFormSubmit = useCallback(
    async (txId: string, isExecuted = false, isRoleExecution = false, isDelegateCreation = false) => {
      onSubmit?.(txId, isExecuted)

      const { data: details } = await trigger({ chainId, txId })
      // Track tx event
      trackTxEvents(details, isCreation, isExecuted, isRoleExecution, isDelegateCreation)
    },
    [chainId, isCreation, onSubmit, trigger],
  )

  const onRoleExecutionSubmit = useCallback<typeof onFormSubmit>(
    (txId, isExecuted) => onFormSubmit(txId, isExecuted, true),
    [onFormSubmit],
  )

  const onDelegateFormSubmit = useCallback<typeof onFormSubmit>(
    (txId, isExecuted) => onFormSubmit(txId, isExecuted, false, true),
    [onFormSubmit],
  )

  return (
    <>
      <TxCard>
        {props.children}

        {decodedData && (
          <ErrorBoundary fallback={<></>}>
            <ConfirmationOrder decodedData={decodedData} toAddress={safeTx?.data.to ?? ''} />
          </ErrorBoundary>
        )}

        {!props.isRejection && decodedData && (
          <ErrorBoundary fallback={<div>Error parsing data</div>}>
            {isApproval && <ApprovalEditor safeTransaction={safeTx} />}

            {showTxDetails && <TxData txDetails={txDetails} imitation={false} trusted />}

            <DecodedTx
              tx={safeTx}
              txId={props.txId}
              decodedData={decodedData}
              showMultisend={!props.isBatch}
              showMethodCall={
                props.showMethodCall && !showTxDetails && !isApproval && isGenericConfirmation(decodedData)
              }
            />
          </ErrorBoundary>
        )}
        {!isCounterfactualSafe && !props.isRejection && <BlockaidBalanceChanges />}
      </TxCard>

      {!isCounterfactualSafe && !props.isRejection && <TxChecks />}

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

        {(canExecute || canExecuteThroughRole) && !props.onlyExecute && !isCounterfactualSafe && !isDelegate && (
          <ExecuteCheckbox onChange={setShouldExecute} />
        )}

        <NetworkWarning />

        <UnknownContractError />

        <Blockaid />

        {isCounterfactualSafe && !isDelegate && (
          <CounterfactualForm {...props} safeTx={safeTx} isCreation={isCreation} onSubmit={onFormSubmit} onlyExecute />
        )}
        {!isCounterfactualSafe && willExecute && !isDelegate && (
          <ExecuteForm {...props} safeTx={safeTx} isCreation={isCreation} onSubmit={onFormSubmit} />
        )}
        {!isCounterfactualSafe && willExecuteThroughRole && (
          <ExecuteThroughRoleForm
            {...props}
            safeTx={safeTx}
            safeTxError={safeTxError}
            onSubmit={onRoleExecutionSubmit}
            role={(allowingRole || mostLikelyRole)!}
          />
        )}
        {!isCounterfactualSafe && !willExecute && !willExecuteThroughRole && !isDelegate && (
          <SignForm
            {...props}
            safeTx={safeTx}
            isBatchable={isBatchable}
            isCreation={isCreation}
            onSubmit={onFormSubmit}
          />
        )}

        {isDelegate && <DelegateForm {...props} safeTx={safeTx} onSubmit={onDelegateFormSubmit} />}
      </TxCard>
    </>
  )
}

const useSafeTx = () => useContext(SafeTxContext).safeTx
const useSafeTxError = () => useContext(SafeTxContext).safeTxError

export default madProps(SignOrExecuteForm, {
  chainId: useChainId,
  safeTx: useSafeTx,
  safeTxError: useSafeTxError,
})
