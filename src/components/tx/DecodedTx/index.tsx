import { type SyntheticEvent, type ReactElement, memo } from 'react'
import {
  isCustomTxInfo,
  isMultisigDetailedExecutionInfo,
  isNativeTokenTransfer,
  isTransferTxInfo,
} from '@/utils/transaction-guards'
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack } from '@mui/material'
import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { DecodedDataResponse, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import Summary, { PartialSummary } from '@/components/transactions/TxDetails/Summary'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DecodedData from '@/components/transactions/TxDetails/TxData/DecodedData'
import accordionCss from '@/styles/accordion.module.css'
import HelpToolTip from './HelpTooltip'

type DecodedTxProps = {
  tx?: SafeTransaction
  txId?: string
  txDetails?: TransactionDetails
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
  txDetails,
  decodedData,
  showMultisend = true,
  showMethodCall = false,
}: DecodedTxProps): ReactElement => {
  const isMultisend = decodedData?.parameters && !!decodedData?.parameters[0]?.valueDecoded
  const isMethodCallInAdvanced = !showMethodCall || (isMultisend && showMultisend)

  const onChangeExpand = (_: SyntheticEvent, expanded: boolean) => {
    trackEvent({ ...MODALS_EVENTS.TX_DETAILS, label: expanded ? 'Open' : 'Close' })
  }
  const addressInfoIndex = txDetails?.txData?.addressInfoIndex

  const isCreation =
    txDetails &&
    isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo) &&
    txDetails.detailedExecutionInfo.confirmations.length === 0

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
  if (txDetails && isCustomTxInfo(txDetails?.txInfo)) {
    toInfo = txDetails?.txInfo.to
  }

  const decodedDataBlock = <DecodedData txData={txData} toInfo={toInfo} />
  const showDecodedData = isMethodCallInAdvanced && decodedData?.method

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
            {txDetails &&
              isTransferTxInfo(txDetails.txInfo) &&
              isNativeTokenTransfer(txDetails.txInfo.transferInfo) &&
              'native transfer'}
          </AccordionSummary>
          <AccordionDetails data-testid="decoded-tx-details">
            {showDecodedData && (
              <>
                {decodedDataBlock}
                <Divider />
              </>
            )}

            {txDetails && !showDecodedData && !isCreation ? (
              <Summary
                txDetails={txDetails}
                defaultExpanded
                hideDecodedData={isMethodCallInAdvanced && !!decodedData?.method}
              />
            ) : (
              tx && <PartialSummary safeTx={tx} />
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  )
}

export default memo(DecodedTx)
