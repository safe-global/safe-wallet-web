import { type SyntheticEvent, type ReactElement, useMemo } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Typography } from '@mui/material'
import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import {
  type DecodedDataResponse,
  getDecodedData,
  getTransactionDetails,
  type TransactionDetails,
  Operation,
} from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import ErrorMessage from '../ErrorMessage'
import Summary from '@/components/transactions/TxDetails/Summary'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { isEmptyHexData } from '@/utils/hex'
import ApprovalEditor from '@/components/tx/ApprovalEditor'
import { ErrorBoundary } from '@sentry/react'
import { getNativeTransferData } from '@/services/tx/tokenTransferParams'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'

type DecodedTxProps = {
  tx?: SafeTransaction
  txId?: string
}

const DecodedTx = ({ tx, txId }: DecodedTxProps): ReactElement | null => {
  const chainId = useChainId()
  const encodedData = tx?.data.data
  const isEmptyData = !!encodedData && isEmptyHexData(encodedData)
  const isRejection = isEmptyData && tx?.data.value === '0'
  const nativeTransfer = isEmptyData && !isRejection ? getNativeTransferData(tx?.data) : undefined

  const [decodedData = nativeTransfer, decodedDataError, decodedDataLoading] = useAsync<DecodedDataResponse>(() => {
    if (!encodedData || isEmptyData) return
    return getDecodedData(chainId, encodedData)
  }, [chainId, encodedData, isEmptyData])

  const isMultisend = !!decodedData?.parameters?.[0]?.valueDecoded

  const [txDetails, txDetailsError, txDetailsLoading] = useAsync<TransactionDetails>(() => {
    if (!txId) return
    return getTransactionDetails(chainId, txId)
  }, [])

  const approvalEditorTx = useMemo(() => {
    if (!decodedData || !txDetails?.txData) {
      return undefined
    }
    return { ...decodedData, to: txDetails?.txData?.to.value }
  }, [decodedData, txDetails?.txData])

  const onChangeExpand = (_: SyntheticEvent, expanded: boolean) => {
    trackEvent({ ...MODALS_EVENTS.TX_DETAILS, label: expanded ? 'Open' : 'Close' })
  }

  if (isRejection) return null

  return (
    <Box mb={2}>
      {approvalEditorTx && (
        <ErrorBoundary fallback={<div>Error parsing data</div>}>
          <ApprovalEditor safeTransaction={tx} />
        </ErrorBoundary>
      )}

      {isMultisend && (
        <Box my={2}>
          <Multisend
            txData={{
              dataDecoded: decodedData,
              to: { value: tx?.data.to || '' },
              value: tx?.data.value,
              operation: tx?.data.operation === OperationType.DelegateCall ? Operation.DELEGATE : Operation.CALL,
              trustedDelegateCallTarget: false,
            }}
            compact
          />
        </Box>
      )}

      <Accordion elevation={0} onChange={onChangeExpand} sx={!tx ? { pointerEvents: 'none' } : undefined}>
        <AccordionSummary>Transaction details</AccordionSummary>

        <AccordionDetails>
          {decodedData ? (
            <MethodDetails data={decodedData} />
          ) : decodedDataError ? (
            <ErrorMessage error={decodedDataError}>Failed decoding transaction data</ErrorMessage>
          ) : (
            decodedDataLoading && <Skeleton />
          )}

          {txDetails ? (
            <Box mt={2}>
              <Typography variant="overline" fontWeight="bold" color="border.main">
                Advanced details
              </Typography>
              <Summary txDetails={txDetails} defaultExpanded />
            </Box>
          ) : txDetailsError ? (
            <ErrorMessage error={txDetailsError}>Failed loading transaction details</ErrorMessage>
          ) : (
            txDetailsLoading && <Skeleton />
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default DecodedTx
