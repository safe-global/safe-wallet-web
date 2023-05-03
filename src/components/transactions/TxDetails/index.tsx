import { Box, CircularProgress } from '@mui/material'
import type { TransactionDetails, TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { getTransactionDetails, Operation } from '@safe-global/safe-gateway-typescript-sdk'
import { type ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import SignTxButton from '@/components/transactions/SignTxButton'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import TxSigners from '@/components/transactions/TxSigners'
import { DelegateCallWarning, UnsignedWarning } from '@/components/transactions/Warning'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useIsPending from '@/hooks/useIsPending'
import useSafeInfo from '@/hooks/useSafeInfo'
import {
  isAwaitingExecution,
  isModuleExecutionInfo,
  isMultiSendTxInfo,
  isMultisigDetailedExecutionInfo,
  isMultisigExecutionInfo,
  isSupportedMultiSendAddress,
  isTxQueued,
} from '@/utils/transaction-guards'
import { ErrorBoundary } from '@sentry/react'
import TxShareLink from '../TxShareLink'
import css from './styles.module.css'

export const NOT_AVAILABLE = 'n/a'

type TxDetailsProps = {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}

const TxDetailsBlock = ({ txSummary, txDetails }: TxDetailsProps): ReactElement => {
  const chainId = useChainId()
  const isPending = useIsPending(txSummary.id)
  const isQueue = isTxQueued(txSummary.txStatus)
  const awaitingExecution = isAwaitingExecution(txSummary.txStatus)
  const isUnsigned =
    isMultisigExecutionInfo(txSummary.executionInfo) && txSummary.executionInfo.confirmationsSubmitted === 0

  const isUntrusted =
    isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo) &&
    txDetails.detailedExecutionInfo.trusted === false

  return (
    <>
      {/* /Details */}
      <div className={`${css.details} ${isUnsigned ? css.noSigners : ''}`}>
        <div className={css.shareLink}>
          <TxShareLink id={txSummary.id} />
        </div>

        <div className={css.txData}>
          <ErrorBoundary fallback={<div>Error parsing data</div>}>
            <TxData txDetails={txDetails} />
          </ErrorBoundary>
        </div>

        {/* Module information*/}
        {isModuleExecutionInfo(txSummary.executionInfo) && (
          <div className={css.txModule}>
            <InfoDetails title="Module:">
              <EthHashInfo
                address={txSummary.executionInfo.address.value}
                shortAddress={false}
                showCopyButton
                hasExplorer
              />
            </InfoDetails>
          </div>
        )}

        <div className={css.txSummary}>
          {isUntrusted && !isPending && <UnsignedWarning />}

          {txDetails.txData?.operation === Operation.DELEGATE && (
            <div className={css.delegateCall}>
              <DelegateCallWarning showWarning={!txDetails.txData.trustedDelegateCallTarget} />
            </div>
          )}
          <Summary txDetails={txDetails} />
        </div>

        {isSupportedMultiSendAddress(txDetails.txInfo, chainId) && isMultiSendTxInfo(txDetails.txInfo) && (
          <div className={`${css.multiSend}`}>
            <ErrorBoundary fallback={<div>Error parsing data</div>}>
              <Multisend txData={txDetails.txData} />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Signers */}
      {!isUnsigned && (
        <div className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />

          {isQueue && (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
              {awaitingExecution ? <ExecuteTxButton txSummary={txSummary} /> : <SignTxButton txSummary={txSummary} />}
              <RejectTxButton txSummary={txSummary} />
            </Box>
          )}
        </div>
      )}
    </>
  )
}

const TxDetails = ({
  txSummary,
  txDetails,
}: {
  txSummary: TransactionSummary
  txDetails?: TransactionDetails // optional
}): ReactElement => {
  const chainId = useChainId()
  const { safe } = useSafeInfo()

  const [txDetailsData, error, loading] = useAsync<TransactionDetails>(
    async () => {
      return txDetails || getTransactionDetails(chainId, txSummary.id)
    },
    [txDetails, chainId, txSummary.id, safe.txQueuedTag],
    false,
  )

  return (
    <div className={css.container}>
      {txDetailsData && <TxDetailsBlock txSummary={txSummary} txDetails={txDetailsData} />}
      {loading && (
        <div className={css.loading}>
          <CircularProgress />
        </div>
      )}
      {error && (
        <div className={css.error}>
          <ErrorMessage error={error}>Couldn&apos;t load the transaction details</ErrorMessage>
        </div>
      )}
    </div>
  )
}

export default TxDetails
