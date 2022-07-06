import { ReactElement } from 'react'
import { isAddress, isArrayParameter } from '@/utils/transaction-guards'
import EthHashInfo from '@/components/common/EthHashInfo'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { Box, Typography } from '@mui/material'
import css from './styles.module.css'

type ValueArrayProps = {
  method: string
  type: string
  value: string | string[]
  key?: string
}

export const Value = ({ type, ...props }: ValueArrayProps): ReactElement => {
  if (isArrayParameter(type) && isAddress(type)) {
    return (
      <Box>
        [
        <div className={css.nestedWrapper}>
          {(props.value as string[]).map((address, index) => {
            const key = `${props.key || props.method}-${index}`
            if (Array.isArray(address)) {
              const newProps = {
                type,
                ...props,
                value: address,
                key,
              }
              return <Value {...newProps} />
            }
            return (
              <EthHashInfo
                key={`${address}_${key}`}
                address={address}
                showAvatar={false}
                // explorerUrl={explorerUrl}
              />
            )
          })}
        </div>
        ]
      </Box>
    )
  }

  return <GenericValue type={type} {...props} />
}

const GenericValue = ({ method, type, value }: ValueArrayProps): React.ReactElement => {
  const getTextValue = (value: string, key?: string) => <HexEncodedData limit={60} hexData={value} key={key} />

  const getArrayValue = (parentId: string, value: string[] | string) => (
    <Box>
      [
      <div className={css.nestedWrapper}>
        {(value as string[]).map((currentValue, index, values) => {
          const key = `${parentId}-value-${index}`
          return Array.isArray(currentValue) ? (
            <>
              <Typography key={key}>{getArrayValue(key, currentValue)}</Typography>
            </>
          ) : (
            getTextValue(currentValue, key)
          )
        })}
      </div>
      ]
    </Box>
  )

  if (isArrayParameter(type) || Array.isArray(value)) {
    return getArrayValue(method, value)
  }

  return getTextValue(value as string)
}
