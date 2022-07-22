import { type ReactElement } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Grid, Skeleton } from '@mui/material'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { type DecodedDataResponse, getDecodedData } from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import ErrorMessage from '../ErrorMessage'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'

type DecodedTxProps = {
  tx?: SafeTransaction
}

const DecodedTx = ({ tx }: DecodedTxProps): ReactElement | null => {
  const chainId = useChainId()
  const encodedData = tx?.data.data
  const isNativeTransfer = encodedData && isNaN(parseInt(encodedData, 16))

  const [decodedData, error] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!encodedData || isNativeTransfer) return
    return getDecodedData(chainId, encodedData)
  }, [chainId, encodedData, isNativeTransfer])

  if (isNativeTransfer) return null

  return (
    <Accordion elevation={0}>
      <AccordionSummary>Transaction data</AccordionSummary>

      <AccordionDetails>
        {encodedData && decodedData ? (
          <>
            <Grid container>
              <b>Raw data:&nbsp;</b>
              {generateDataRowValue(encodedData, 'rawData')}
            </Grid>

            <MethodDetails data={decodedData} />
          </>
        ) : error ? (
          <ErrorMessage error={error}>Failed decoding transaction data</ErrorMessage>
        ) : (
          <Skeleton />
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default DecodedTx
