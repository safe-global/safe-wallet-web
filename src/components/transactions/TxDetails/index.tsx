import { Box, CircularProgress } from '@mui/material'
import type { TransactionDetails, TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
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
import { useHasFeature } from '@/hooks/useChains'
import useIsPending from '@/hooks/useIsPending'
import useSafeInfo from '@/hooks/useSafeInfo'
import { FEATURES } from '@/utils/chains'
import {
  isAwaitingExecution,
  isModuleExecutionInfo,
  isMultiSendTxInfo,
  isMultisigDetailedExecutionInfo,
  isMultisigExecutionInfo,
  isTxQueued,
} from '@/utils/transaction-guards'
import { isTrustedTx } from '@/utils/transactions'
import { ErrorBoundary } from '@sentry/react'
import TxShareLink from '../TxShareLink'
import css from './styles.module.css'

export const NOT_AVAILABLE = 'n/a'

type TxDetailsProps = {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}

const TxDetailsBlock = ({ txSummary, txDetails }: TxDetailsProps): ReactElement => {
  const isPending = useIsPending(txSummary.id)
  const hasDefaultTokenlist = useHasFeature(FEATURES.DEFAULT_TOKENLIST)
  const isQueue = isTxQueued(txSummary.txStatus)
  const awaitingExecution = isAwaitingExecution(txSummary.txStatus)
  const isUnsigned =
    isMultisigExecutionInfo(txSummary.executionInfo) && txSummary.executionInfo.confirmationsSubmitted === 0

  const isUntrusted =
    isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo) &&
    txDetails.detailedExecutionInfo.trusted === false

  // If we have no token list we always trust the transfer
  const isTrustedTransfer = !hasDefaultTokenlist || isTrustedTx(txSummary)

  return (
    <>
      {/* /Details */}
      <div data-sid="59311" className={`${css.details} ${isUnsigned ? css.noSigners : ''}`}>
        <div data-sid="37428" className={css.shareLink}>
          <TxShareLink id={txSummary.id} />
        </div>

        <div data-sid="17901" className={css.txData}>
          <ErrorBoundary fallback={<div>Error parsing data</div>}>
            <TxData txDetails={txDetails} trusted={isTrustedTransfer} />
          </ErrorBoundary>
        </div>

        {/* Module information*/}
        {isModuleExecutionInfo(txSummary.executionInfo) && (
          <div data-sid="91886" className={css.txModule}>
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

        <div data-sid="16496" className={css.txSummary}>
          {isUntrusted && !isPending && <UnsignedWarning />}

          {txDetails.txData?.operation === Operation.DELEGATE && (
            <div data-sid="34674" className={css.delegateCall}>
              <DelegateCallWarning showWarning={!txDetails.txData.trustedDelegateCallTarget} />
            </div>
          )}
          <Summary txDetails={txDetails} />
        </div>

        {isMultiSendTxInfo(txDetails.txInfo) && (
          <div data-sid="26076" className={`${css.multiSend}`}>
            <ErrorBoundary fallback={<div>Error parsing data</div>}>
              <Multisend txData={txDetails.txData} />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Signers */}
      {!isUnsigned && (
        <div data-sid="51881" className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />

          {isQueue && (
            <Box data-sid="14449" display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [txDetails, chainId, txSummary.id, safe.txQueuedTag],
    false,
  )

  return (
    <div data-sid="17529" className={css.container}>
      {txDetailsData ? (
        <TxDetailsBlock txSummary={txSummary} txDetails={txDetailsData} />
      ) : loading ? (
        <div data-sid="84811" className={css.loading}>
          <CircularProgress />
        </div>
      ) : (
        error && (
          <div data-sid="33992" className={css.error}>
            <ErrorMessage error={error}>Couldn&apos;t load the transaction details</ErrorMessage>
          </div>
        )
      )}
    </div>
  )
}

export default TxDetails
