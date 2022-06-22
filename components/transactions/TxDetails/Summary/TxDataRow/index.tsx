import { shortenAddress } from '@/services/formatters'
import { Box, Typography } from '@mui/material'
import { hexDataLength } from 'ethers/lib/utils'
import { ReactElement, ReactNode } from 'react'
import css from './styles.module.css'

interface Props {
  children?: ReactNode
  inlineType?: 'hash' | 'rawData' | 'address' | 'bytes'
  hasExplorer?: boolean
  title: string
  value?: string | null
  isArray?: boolean
  method?: string
  paramType?: string
}

const generateInlineTypeValue = (
  type: Props['inlineType'],
  value: string,
  hasExplorer?: boolean,
): ReactElement | null => {
  if (!value) return null
  switch (type) {
    case 'address':
      return (
        <div className={css.inline}>
          {/* TODO: missing the chain prefix */}
          <p>{shortenAddress(value, 8)}</p>
          {/* TODO: missing copy button */}
          {/* TODO: missing block explorer button */}
        </div>
      )
    case 'hash':
      return (
        <div className={css.inline}>
          <div>{shortenAddress(value, 8)}</div>
          {/* TODO: missing copy button */}
          {/* TODO: missing block explorer button */}
        </div>
      )
    case 'rawData':
      return (
        <div className={css.rawData}>
          <div>{value ? hexDataLength(value) : 0} bytes</div>
          {/* TODO: missing copy button */}
        </div>
      )
    // case 'bytes':
    //   return <HexEncodedData limit={60} hexData={value} />
  }
  return null
}

export const TxDataRow = ({
  children,
  inlineType,
  hasExplorer = true,
  title,
  value,
  isArray,
  method,
  paramType,
}: Props): ReactElement | null => {
  if (value == undefined) return null
  return (
    <div className={css.gridRow}>
      <Box
        sx={({ palette }) => ({
          color: palette.black[400],
        })}
      >
        <Typography variant="body1">{title}</Typography>
      </Box>
      {isArray && method && paramType && (
        <div className={css.valueWrapper}>
          {/* <Value method={method} type={paramType} value={value} /> */}
          {JSON.stringify(value)}
        </div>
      )}
      {!isArray && generateInlineTypeValue(inlineType, value, hasExplorer)}
      {!isArray && !inlineType && <span>{value}</span>}
      {children}
    </div>
  )
}
