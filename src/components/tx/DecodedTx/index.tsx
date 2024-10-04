import { type SyntheticEvent, type ReactElement, memo } from 'react'
import { isCustomTxInfo } from '@/utils/transaction-guards'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Stack } from '@mui/material'
import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { DecodedDataResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import ErrorMessage from '../ErrorMessage'
import Summary, { PartialSummary } from '@/components/transactions/TxDetails/Summary'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DecodedData from '@/components/transactions/TxDetails/TxData/DecodedData'
import accordionCss from '@/styles/accordion.module.css'
import HelpToolTip from './HelpTooltip'
import { useGetTransactionDetailsQuery } from '@/store/gateway'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { asError } from '@/services/exceptions/utils'

type DecodedTxProps = {
  tx?: SafeTransaction
  txId?: string
  showMultisend?: boolean
  decodedData?: DecodedDataResponse
  showMethodCall?: boolean
}

export const Divider = () => (
  <Box
    borderBottom="1px solid var(--color-border-light)"
    width="calc(100% + 32px)"
    my={2}
    sx={{ ml: '-16px !important' }}
  />
)

const DecodedTx = ({
  tx,
  txId,
  decodedData,
  showMultisend = true,
  showMethodCall = false,
}: DecodedTxProps): ReactElement => {
  const chainId = useChainId()
  const isMultisend = !!decodedData?.parameters?.[0]?.valueDecoded
  const isMethodCallInAdvanced = !showMethodCall || (isMultisend && showMultisend)

  const {
    data: txDetails,
    error: txDetailsError,
    isLoading: txDetailsLoading,
  } = useGetTransactionDetailsQuery(
    chainId && txId
      ? {
          chainId,
          txId,
        }
      : skipToken,
  )

  const onChangeExpand = (_: SyntheticEvent, expanded: boolean) => {
    trackEvent({ ...MODALS_EVENTS.TX_DETAILS, label: expanded ? 'Open' : 'Close' })
  }
  const addressInfoIndex = txDetails?.txData?.addressInfoIndex

  const txData = {
    dataDecoded: decodedData,
    to: { value: tx?.data.to || '' },
    value: tx?.data.value,
    hexData: tx?.data.data,
    operation: tx?.data.operation === OperationType.DelegateCall ? Operation.DELEGATE : Operation.CALL,
    trustedDelegateCallTarget: txDetails?.txData?.trustedDelegateCallTarget ?? true,
    addressInfoIndex,
  }

  let toInfo = tx && {
    value: tx.data.to,
  }
  if (txDetails && isCustomTxInfo(txDetails.txInfo)) {
    toInfo = txDetails.txInfo.to
  }

  const decodedDataBlock = <DecodedData txData={txData} toInfo={toInfo} />

  return (
    <Stack spacing={2}>
      {!isMethodCallInAdvanced && (
        <Box border="1px solid var(--color-border-light)" borderRadius={1} p={2}>
          {decodedDataBlock}
        </Box>
      )}

      {isMultisend && showMultisend && <Multisend txData={txDetails?.txData || txData} compact />}

      <Box>
        <Accordion elevation={0} onChange={onChangeExpand} sx={!tx ? { pointerEvents: 'none' } : undefined}>
          <AccordionSummary
            data-testid="decoded-tx-summary"
            expandIcon={<ExpandMoreIcon />}
            className={accordionCss.accordion}
          >
            Advanced details
            <HelpToolTip />
            <Box flexGrow={1} />
            {isMethodCallInAdvanced && decodedData?.method}
            {!showMethodCall && !decodedData?.method && Number(tx?.data.value) > 0 && 'native transfer'}
          </AccordionSummary>

          <AccordionDetails data-testid="decoded-tx-details">
            {isMethodCallInAdvanced && decodedData?.method && (
              <>
                {decodedDataBlock}
                <Divider />
              </>
            )}

            {txDetails ? (
              <Summary
                txDetails={txDetails}
                defaultExpanded
                hideDecodedData={isMethodCallInAdvanced && !!decodedData?.method}
              />
            ) : (
              tx && <PartialSummary safeTx={tx} />
            )}

            {txDetailsLoading && <Skeleton />}

            {txDetailsError && (
              <ErrorMessage error={asError(txDetailsError)}>Failed loading all transaction details</ErrorMessage>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  )
}

export default memo(DecodedTx)
