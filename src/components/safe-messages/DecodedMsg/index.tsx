import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { Value } from '@/components/transactions/TxDetails/TxData/DecodedData/ValueArray'
import { isByte } from '@/utils/transaction-guards'
import { normalizeTypedData } from '@/utils/web3'
import { Box, Typography } from '@mui/material'
import type { EIP712TypedData, SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { isAddress } from 'ethers/lib/utils'
import { isObject } from 'lodash'
import type { ReactElement } from 'react'
import Msg from '../Msg'

export const DecodedMsg = ({ message }: { message: SafeMessage['message'] }): ReactElement => {
  const isTextMessage = typeof message === 'string'

  if (isTextMessage) {
    return <Msg message={message} />
  }

  // Normalize message such that we know the primaryType
  const normalizedMsg = normalizeTypedData(message) as EIP712TypedData & {
    primaryType: string
  }

  const { primaryType, types, message: msg } = normalizedMsg

  const findTypeInPrimaryType = (paramName: string) => types[primaryType].find((type) => type.name === paramName)?.type

  return (
    <Box>
      <Typography
        textTransform="uppercase"
        fontWeight={700}
        variant="caption"
        sx={({ palette }) => ({ color: `${palette.border.main}` })}
      >
        {primaryType}
      </Typography>

      {Object.entries(msg).map((param, index) => {
        const [paramName, paramValue] = param
        const type = findTypeInPrimaryType(paramName) || 'string'

        const isArrayValueParam = Array.isArray(paramValue)
        const isNested = isObject(paramValue)
        const inlineType = isAddress(paramValue as string) ? 'address' : isByte(type) ? 'bytes' : undefined
        const paramValueAsString = typeof paramValue === 'string' ? paramValue : JSON.stringify(paramValue, null, 2)
        return (
          <TxDataRow key={`${primaryType}_param-${index}`} title={`${param[0]}(${type}):`}>
            {isArrayValueParam ? (
              <Value method={primaryType} type={type} value={paramValueAsString} />
            ) : isNested ? (
              <Box
                sx={{
                  border: ({ palette }) => `1px ${palette.border.light} solid`,
                  whiteSpace: 'pre',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  borderRadius: '6px',
                  padding: 1,
                }}
              >
                {paramValueAsString}
              </Box>
            ) : (
              generateDataRowValue(paramValueAsString, inlineType, true)
            )}
          </TxDataRow>
        )
      })}
    </Box>
  )
}
