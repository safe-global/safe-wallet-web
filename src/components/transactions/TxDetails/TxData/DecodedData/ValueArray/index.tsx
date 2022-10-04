import type { ReactElement } from 'react'
import { Typography } from '@mui/material'
import { isAddress, isArrayParameter } from '@/utils/transaction-guards'
import EthHashInfo from '@/components/common/EthHashInfo'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
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
      <Typography component="div" variant="body2">
        [
        <div className={css.nestedWrapper}>
          {(props.value as string[]).map((address, index) => {
            const key = `${props.key || props.method}-${index}`
            if (Array.isArray(address)) {
              const newProps = {
                type,
                ...props,
                value: address,
              }
              return <Value key={key} {...newProps} />
            }
            return (
              <EthHashInfo
                key={`${address}_${key}`}
                address={address}
                showAvatar={false}
                shortAddress={false}
                showCopyButton
                hasExplorer
              />
            )
          })}
        </div>
        ]
      </Typography>
    )
  }

  return <GenericValue type={type} {...props} />
}

const GenericValue = ({ method, type, value }: ValueArrayProps): React.ReactElement => {
  const getTextValue = (value: string, key?: string) => <HexEncodedData limit={60} hexData={value} key={key} />

  const getArrayValue = (parentId: string, value: string[] | string, separator?: boolean) => (
    <Typography component="div" variant="body2">
      [
      <div className={css.nestedWrapper}>
        {(value as string[]).map((currentValue, index, values) => {
          const key = `${parentId}-value-${index}`
          const hasSeparator = index < values.length - 1

          return Array.isArray(currentValue) ? (
            <div key={key}>{getArrayValue(key, currentValue, hasSeparator)}</div>
          ) : (
            getTextValue(currentValue, key)
          )
        })}
      </div>
      ]{separator ? ',' : null}
    </Typography>
  )

  if (isArrayParameter(type) || Array.isArray(value)) {
    return getArrayValue(method, value)
  }

  return getTextValue(value as string)
}
