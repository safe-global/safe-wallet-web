import { type ReactElement } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Typography } from '@mui/material'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { type DecodedDataResponse, getDecodedData } from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import ErrorMessage from '../ErrorMessage'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import EthHashInfo from '@/components/common/EthHashInfo'

const DecodedTx = ({ tx }: { tx: SafeTransaction }): ReactElement | null => {
  const chainId = useChainId()
  const encodedData = tx.data.data
  const isNativeTransfer = encodedData && isNaN(parseInt(encodedData, 16))

  const [decodedData, error, loading] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!encodedData || isNativeTransfer) return
    return getDecodedData(chainId, encodedData)
  }, [chainId, encodedData, isNativeTransfer])

  return (
    <Box mb={2}>
      <Accordion elevation={0}>
        <AccordionSummary>
          <Box flex={1}>Transaction data</Box>
          {encodedData ? generateDataRowValue(encodedData, 'rawData') : ''}
        </AccordionSummary>

        <AccordionDetails>
          {decodedData && decodedData.parameters.length > 0 ? (
            <MethodDetails data={decodedData} />
          ) : (
            <Box>
              <Typography color="secondary.light">Interact with:</Typography>
              <EthHashInfo address={tx.data.to} showAvatar showCopyButton hasExplorer />
            </Box>
          )}

          {error && <ErrorMessage error={error}>Failed decoding transaction data</ErrorMessage>}
          {loading && <Skeleton />}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default DecodedTx
