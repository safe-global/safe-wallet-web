import { type ReactElement } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton } from '@mui/material'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import {
  type DecodedDataResponse,
  getDecodedData,
  getTransactionDetails,
  type TransactionDetails,
} from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import ErrorMessage from '../ErrorMessage'
import Summary from '@/components/transactions/TxDetails/Summary'

type DecodedTxProps = {
  tx: SafeTransaction
  txId?: string
}

const DecodedTx = ({ tx, txId }: DecodedTxProps): ReactElement | null => {
  const chainId = useChainId()
  const encodedData = tx.data.data
  const isNativeTransfer = encodedData && isNaN(parseInt(encodedData, 16))

  const [decodedData, decodedDataError, decodedDataLoading] = useAsync<DecodedDataResponse>(() => {
    if (!encodedData || isNativeTransfer) return
    return getDecodedData(chainId, encodedData)
  }, [chainId, encodedData, isNativeTransfer])

  const [txDetails, txDetailsError, txDetailsLoading] = useAsync<TransactionDetails>(() => {
    if (!txId) return
    return getTransactionDetails(chainId, txId)
  }, [])

  if (isNativeTransfer && !txId) {
    return null
  }

  return (
    <Box mb={2}>
      <Accordion elevation={0}>
        <AccordionSummary>Transaction details</AccordionSummary>

        <AccordionDetails>
          {txDetails ? (
            <Box mb={1}>
              <Summary txDetails={txDetails} defaultExpanded />
            </Box>
          ) : txDetailsError ? (
            <ErrorMessage error={txDetailsError}>Failed loading transaction details</ErrorMessage>
          ) : (
            txDetailsLoading && <Skeleton />
          )}

          {decodedData ? (
            <MethodDetails data={decodedData} />
          ) : decodedDataError ? (
            <ErrorMessage error={decodedDataError}>Failed decoding transaction data</ErrorMessage>
          ) : (
            decodedDataLoading && <Skeleton />
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default DecodedTx
