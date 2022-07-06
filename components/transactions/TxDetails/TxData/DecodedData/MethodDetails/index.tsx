import { ReactElement } from 'react'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { camelCaseToSpaces } from '@/utils/formatters'
import { isAddress, isArrayParameter, isByte } from '@/utils/transaction-guards'
import { DataDecoded } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Typography } from '@mui/material'

type MethodDetailsProps = {
  data: DataDecoded
}

export const MethodDetails = ({ data }: MethodDetailsProps): ReactElement => {
  const methodName = camelCaseToSpaces(data.method)
  return (
    <Box py="8px">
      <Typography variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'rgb(93, 109, 116)' }}>
        <b>{methodName}</b>
      </Typography>

      {data.parameters?.map((param, index) => {
        const isArrayValueParam = isArrayParameter(param.type) || Array.isArray(param.value)
        const inlineType = isAddress(param.type) ? 'address' : isByte(param.type) ? 'bytes' : undefined
        const value = `${param.value}`
        return (
          <TxDataRow key={`${data.method}_param-${index}`} title={`${param.name}(${param.type}):`}>
            {generateDataRowValue(value, inlineType)}
          </TxDataRow>
        )
      })}
    </Box>
  )
}
