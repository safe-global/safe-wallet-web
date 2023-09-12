import type { ReactElement } from 'react'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { isAddress, isArrayParameter, isByte } from '@/utils/transaction-guards'
import type { AddressEx, DataDecoded } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Typography } from '@mui/material'
import { Value } from '@/components/transactions/TxDetails/TxData/DecodedData/ValueArray'
import { camelCaseToSpaces } from '@/utils/formatters'

type MethodDetailsProps = {
  data: DataDecoded
  addressInfoIndex?: {
    [key: string]: AddressEx
  }
}

export const MethodDetails = ({ data, addressInfoIndex }: MethodDetailsProps): ReactElement => {
  return (
    <Box>
      <Typography variant="overline" fontWeight="bold" color="border.main">
        {camelCaseToSpaces(data.method)}
      </Typography>

      {data.parameters?.map((param, index) => {
        const isArrayValueParam = isArrayParameter(param.type) || Array.isArray(param.value)
        const inlineType = isAddress(param.type) ? 'address' : isByte(param.type) ? 'bytes' : undefined
        const addressEx = typeof param.value === 'string' ? addressInfoIndex?.[param.value] : undefined

        return (
          <TxDataRow key={`${data.method}_param-${index}`} title={`${param.name}(${param.type}):`}>
            {isArrayValueParam ? (
              <Value method={data.method} type={param.type} value={param.value as string} />
            ) : (
              generateDataRowValue(param.value as string, inlineType, true, addressEx)
            )}
          </TxDataRow>
        )
      })}
    </Box>
  )
}
