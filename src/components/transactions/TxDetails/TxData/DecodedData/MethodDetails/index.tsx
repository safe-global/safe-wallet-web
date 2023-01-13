import type { ReactElement } from 'react'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { camelCaseToSpaces } from '@/utils/formatters'
import { isAddress, isArrayParameter, isByte } from '@/utils/transaction-guards'
import type { DataDecoded } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Typography } from '@mui/material'
import { Value } from '@/components/transactions/TxDetails/TxData/DecodedData/ValueArray'

type MethodDetailsProps = {
  data: DataDecoded
}

export const MethodDetails = ({ data }: MethodDetailsProps): ReactElement => {
  const methodName = camelCaseToSpaces(data.method)
  return (
    <Box>
      <Typography variant="overline" sx={({ palette }) => ({ color: `${palette.border.main}` })}>
        <b>{methodName}</b>
      </Typography>

      {data.parameters?.map((param, index) => {
        const isArrayValueParam = isArrayParameter(param.type) || Array.isArray(param.value)
        const inlineType = isAddress(param.type) ? 'address' : isByte(param.type) ? 'bytes' : undefined

        return (
          <TxDataRow key={`${data.method}_param-${index}`} title={`${param.name}(${param.type}):`}>
            {isArrayValueParam ? (
              <Value method={methodName} type={param.type} value={param.value as string} />
            ) : (
              generateDataRowValue(param.value as string, inlineType, true)
            )}
          </TxDataRow>
        )
      })}
    </Box>
  )
}
